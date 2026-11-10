# Kafka demo: exact steps for class

**Windows used** (each one is a Terminal window, opened with Cmd+N):

| Window | Name | Role |
|---|---|---|
| W1 | Admin | start Kafka, create topic, check groups |
| W2 | Producer | you type match events |
| W3 | C5 | consumer in group `statistics` |
| W4 | C1 | consumer in group `live-score` |
| W5 | C2 | consumer in group `live-score` |
| W6 | C3 | consumer in group `live-score` |
| W7 | C4 | consumer in group `live-score` |

---

| # | Step | Intuition | Command / action | Meaning |
|---|---|---|---|---|
| 1 | Open Terminal | We need a terminal on the Mac | Press Cmd+Space, type **Terminal**, press Enter. This is **W1** | A terminal window on your Mac |
| 2 | Start Kafka (W1) | Switch on one Kafka server | `docker run -d --name kafka -p 9092:9092 apache/kafka:4.1.0` | Runs Kafka in a container named `kafka`, in the background (`-d`), on port 9092 |
| 3 | Wait | Kafka needs a few seconds to boot | Wait ~10 seconds | The broker gets ready to accept requests |
| 4 | Go inside Kafka (W1) | Log in to the Kafka server | `docker exec -it kafka bash` | Opens a terminal inside the container. The prompt changes to `...:/$` |
| 5 | Go to Kafka's tools (W1) | Find Kafka's built-in tools | `cd /opt/kafka/bin` | The folder holding Kafka's own tools (`kafka-topics.sh` etc.). The prompt shows `/opt/kafka/bin$` |
| 6 | Create topic (W1) | Make a "football" stream with 3 lanes | `./kafka-topics.sh --bootstrap-server localhost:9092 --create --topic football --partitions 3` | Creates topic `football` with 3 partitions. Expect **Created topic football.** |
| 7 | Describe topic (W1) | Check the 3 lanes exist | `./kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic football` | Shows Partition 0, 1, 2. `Leader: 1` = our one broker |
| 8 | Open W3 | Window for the stats reader | Press **Cmd+N**, then `docker exec -it kafka bash`, then `cd /opt/kafka/bin` | New terminal inside Kafka |
| 9 | Start C5 (W3) | A reader that builds match stats | `./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic football --group statistics --consumer-property client.id=C5 --property print.partition=true --property print.offset=true --property print.key=true` | C5 joins group `statistics` and waits. Each message prints as `Partition  Offset  key  message` |
| 10 | Open W2 | Window for the commentator | Press **Cmd+N**, then `docker exec -it kafka bash`, then `cd /opt/kafka/bin` | New terminal inside Kafka |
| 11 | Start producer (W2) | Commentator ready to send events | `./kafka-console-producer.sh --bootstrap-server localhost:9092 --topic football --property parse.key=true --property key.separator=:` | Shows a `>` prompt. Each line is `key:message`, and the key = matchId |
| 12 | Send events (W2) | Same match always goes to the same lane | Type, pressing Enter after each: `m1:kick-off`, `m4:kick-off`, `m1:goal`, `m1:half-time`, `m2:kick-off` | Producer computes `hash(key) % 3`: m1 → partition 2, m2 → 1, m4 → 0 |
| 13 | Observe W3 | Order kept per match | Look at C5's output | m1 is always Partition 2, offsets 0, 1, 2. Each partition has its own offset count |
| 14 | Open W4 | Window for live-score reader 1 | Press **Cmd+N**, then `docker exec -it kafka bash`, then `cd /opt/kafka/bin` | New terminal inside Kafka |
| 15 | Start C1 (W4) | First live-score reader | `./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic football --group live-score --consumer-property client.id=C1 --property print.partition=true --property print.offset=true --property print.key=true` | C1 joins group `live-score`. It prints nothing yet because a new group starts from the latest message |
| 16 | Check owners (W1) | Who reads which lane? | `./kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group live-score --members --verbose` | C1 has `football:0,1,2`, because it's the only member |
| 17 | Open W5 | Window for live-score reader 2 | Press **Cmd+N**, then `docker exec -it kafka bash`, then `cd /opt/kafka/bin` | New terminal inside Kafka |
| 18 | Start C2 (W5) | Second reader joins | `./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic football --group live-score --consumer-property client.id=C2 --property print.partition=true --property print.offset=true --property print.key=true` | Kafka rebalances the group |
| 19 | Open W6 | Window for live-score reader 3 | Press **Cmd+N**, then `docker exec -it kafka bash`, then `cd /opt/kafka/bin` | New terminal inside Kafka |
| 20 | Start C3 (W6) | Third reader joins | `./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic football --group live-score --consumer-property client.id=C3 --property print.partition=true --property print.offset=true --property print.key=true` | Kafka rebalances again |
| 21 | Check owners (W1) | Work is split evenly | Press **↑** to get the step 16 command, then Enter | C1 = 0, C2 = 1, C3 = 2: one partition each |
| 22 | Send events (W2) | Each event goes to only one reader in a group | Type `m1:corner`, `m2:goal`, `m4:goal` | m1 appears only in C3, m2 only in C2, m4 only in C1 |
| 23 | Observe W3 | Another group gets its own copy | Look at C5 | C5 (`statistics`) shows all 3 events |
| 24 | Open W7 | Window for an extra reader | Press **Cmd+N**, then `docker exec -it kafka bash`, then `cd /opt/kafka/bin` | New terminal inside Kafka |
| 25 | Start C4 (W7) | More readers than lanes | `./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic football --group live-score --consumer-property client.id=C4 --property print.partition=true --property print.offset=true --property print.key=true` | C4 joins `live-score` |
| 26 | Check owners (W1) | Someone has nothing to do | Press **↑** to get the step 16 command, then Enter | C4: `#PARTITIONS 0`, assignment `-` (idle). 4 consumers, 3 partitions |
| 27 | Kill C2 (W5) | A reader dies | Press **Ctrl+C** in W5 | C2 leaves the group. It prints `Processed a total of N messages` |
| 28 | Check owners (W1) | Others take over automatically | Press **↑** to get the step 16 command, then Enter | Auto rebalance: 3 members, each with 1 partition. C2's partition moved |
| 29 | Send event (W2) | Nothing lost, nothing repeated | Type `m2:red-card` | The new owner of partition 1 prints it at **offset 2**, right after C2's last offset (1) |
| 30 | Stop the whole group | All live-score readers go offline | Press **Ctrl+C** in W4 (C1), W6 (C3), W7 (C4) | Group `live-score` has no members. Leave C5 running |
| 31 | Send events (W2) | Events arrive while the group is offline | Type `m1:extra-time`, `m1:penalties` | Stored on disk in partition 2. C5 still receives them |
| 32 | Check offsets (W1) | How far behind is the group? | `./kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group live-score` | Partition 2: CURRENT-OFFSET 6, LOG-END-OFFSET 8, **LAG 2**. Other partitions: LAG 0 (nothing new sent there) |
| 33 | Restart C1 (W4) | The group comes back | Press **↑** in W4 to get the step 15 command, then Enter | C1 prints only the 2 missed messages (offsets 6, 7) |
| 34 | Check offsets (W1) | Caught up | Press **↑** to get the step 32 command, then Enter | LAG 0 on all partitions |
| 35 | Stop C5 (W3) | A group must be stopped before rewinding | Press **Ctrl+C** in W3 | Group `statistics` has no members |
| 36 | Rewind statistics (W1) | Go back to the start | `./kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group statistics --topic football --reset-offsets --to-earliest --execute` | NEW-OFFSET 0 on all 3 partitions |
| 37 | Restart C5 (W3) | Replay everything | Press **↑** in W3 to get the step 9 command, then Enter | C5 prints every message again from offset 0. Reading never deletes messages |
| 38 | Stop everything | End the demo | Press **Ctrl+C** in every window running a consumer or producer | All clients stop |
| 39 | Leave Kafka | Back to the Mac | Type `exit` in every window | The prompt is back to `~ %` (your Mac) |
| 40 | Remove Kafka (W1) | Switch the server off | `docker rm -f kafka` | Container and its data are deleted. The image stays, so the next start is instant |
