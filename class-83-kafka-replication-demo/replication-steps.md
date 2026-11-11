# Kafka replication + acks demo: exact steps

**Setup:** `docker-compose.yml` in this folder starts **4 containers**:

| Container | What it is |
|---|---|
| kafka1, kafka2, kafka3 | 3 Kafka servers. Each one is a **broker** (stores partitions) + a **controller** (1 of them is the active one) |
| client | An empty box with Kafka's tools, where we type commands. It doesn't die when we stop a broker |

**Terminals** (each one is a separate Terminal window, opened with Cmd+N):

| Terminal | Name | Where it runs |
|---|---|---|
| Terminal 1 | Mac | your Mac: start, stop and kill servers |
| Terminal 2 | Admin | inside `client`: describe topic, controller, configs |
| Terminal 3 | Producer | inside `client` |
| Terminal 4 | Consumer | inside `client` |

`--bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092` lists all 3 servers, so commands still work when one is down.
When a server is stopped you will see `WARN Couldn't resolve server kafkaX`. That is harmless: it just means that server is off.

**Before you start (on the Mac):** the single-broker `kafka` container from class 81 may still be running.

| Check | Command | Expect |
|---|---|---|
| What is running | `docker ps` | ideally nothing Kafka-related |
| Remove the old one | `docker rm -f kafka` | `kafka` |

---

| # | Step | Intuition | Command / action | Meaning |
|---|---|---|---|---|
| 1 | Open Terminal 1 (Mac) | Terminal on the Mac | Cmd+Space, type **Terminal**, press Enter | — |
| 2 | Go to the folder (Terminal 1) | Where the cluster file is | `cd ~/Documents/classwork/FLM-system-design/class-83-kafka-replication-demo` | Folder with `docker-compose.yml` |
| 3 | Start the cluster (Terminal 1) | Switch on 3 servers + client box | `docker compose up -d` | Starts kafka1, kafka2, kafka3, client. Wait ~15 seconds |
| 4 | Check (Terminal 1) | All 4 running? | `docker compose ps` | 4 rows, all `Up` |
| 5a | Go inside the client box (Terminal 2, Admin) | Enter the machine that has Kafka's tools | `docker exec -it client bash` | Prompt changes to `...:/$`: you are inside `client` |
| 5b | Go to Kafka's tools (Terminal 2, Admin) | Folder with the `kafka-*.sh` tools | `cd /opt/kafka/bin` | Prompt shows `/opt/kafka/bin$` |
| 6 | Who is the active controller (Terminal 2) | Find the cluster's manager | `./kafka-metadata-quorum.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 describe --status` | `LeaderId` = active controller. `CurrentVoters` = 1, 2, 3 (all three can be controller) |

### What is the controller (the "boss")?

Each of kafka1, kafka2, kafka3 does **two jobs** (`KAFKA_PROCESS_ROLES: broker,controller` in `docker-compose.yml`):

| Job | What it does | kafka1 | kafka2 | kafka3 |
|---|---|---|---|---|
| **Broker** | stores partitions, accepts writes, serves reads | ✓ | ✓ | ✓ |
| **Controller** | the **manager**: who is alive, which server leads each partition, keeps the map (metadata) | **boss** (LeaderId 1) | backup | backup |

The boss has **nothing to do with partition leaders**. Producers and consumers **never talk to it**: messages go straight to partition leaders. It only makes **management decisions**, which need exactly one decision-maker:

| The boss does | Without a boss |
|---|---|
| **Create topic**: decides which server gets which partition and copies | nobody decides where partitions go, so topic creation can't happen |
| **Broker dies**: notices (no heartbeat), picks a new leader for its partitions | the dead broker's partitions stay leaderless, and writes fail forever |
| **ISR changes**: records which copies are up to date | nobody knows which copy is safe to promote |
| **Keeps the map** (who leads what) and sends it to all brokers | brokers disagree, two could both think they lead P0, and data splits |

Think of the boss as a **team manager**: it picks the captain (leader) of each partition, and the players (brokers) do the actual work.


| # | Step | Intuition | Command / action | Meaning |
|---|---|---|---|---|
| 7 | Create topic (Terminal 2) | 2 lanes, each with 3 copies | `./kafka-topics.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --create --topic football --partitions 2 --replication-factor 3 --config min.insync.replicas=2` | RF 3 = 3 copies of every partition. min.insync 2 = with acks=all, at least 2 copies must have the message |
| 8 | Describe topic (Terminal 2) | Where is each copy? | `./kafka-topics.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --describe --topic football 2>/dev/null \| awk 'BEGIN{printf "%-12s %-8s %-22s %s\n","PARTITION","LEADER","COPIES ON","IN SYNC (ISR)"} $3=="Partition:"{c=$8; s=$10; gsub(/[0-9]/,"kafka&",c); gsub(/[0-9]/,"kafka&",s); printf "%-12s %-8s %-22s %s\n","football-"$4,"kafka"$6,c,s}'` | One row per partition: **LEADER** = the server whose copy serves reads and writes, **COPIES ON** = every server holding a copy, **IN SYNC (ISR)** = copies that are up to date |
| 9 | Leader and copies per server (Terminal 1) | Which server holds what, and which copy leads | `D=$(docker exec client /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka1:9092 --describe --topic football); for b in 1 2 3; do for f in $(docker exec kafka$b ls /tmp/kraft-combined-logs \| grep football); do p=${f#football-}; l=$(echo "$D" \| awk -v p=$p '$3=="Partition:" && $4==p {print $6}'); [ "$l" = "$b" ] && r=LEADER \|\| r=copy; echo "kafka$b   $f   $r"; done; done` | One line per folder on each server's disk, e.g. `kafka2  football-0  LEADER`. Every server has both partitions (RF 3). On disk leader and copy look the same: the label comes from the controller's map |
| 10a | Go inside the client box (Terminal 4, Consumer) | Enter the machine that has Kafka's tools | `docker exec -it client bash` | Prompt changes to `...:/$`: you are inside `client` |
| 10b | Go to Kafka's tools (Terminal 4, Consumer) | Folder with the `kafka-*.sh` tools | `cd /opt/kafka/bin` | Prompt shows `/opt/kafka/bin$` |
| 11 | Start consumer (Terminal 4) | Reader waiting for events | `./kafka-console-consumer.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --topic football --group live-score --property print.partition=true --property print.offset=true --property print.key=true` | Reads from each partition's **leader** |
| 12a | Go inside the client box (Terminal 3, Producer) | Enter the machine that has Kafka's tools | `docker exec -it client bash` | Prompt changes to `...:/$`: you are inside `client` |
| 12b | Go to Kafka's tools (Terminal 3, Producer) | Folder with the `kafka-*.sh` tools | `cd /opt/kafka/bin` | Prompt shows `/opt/kafka/bin$` |
| 13 | Start producer with acks=all (Terminal 3) | Safest writes | `./kafka-console-producer.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --topic football --property parse.key=true --property key.separator=: --producer-property acks=all` | "OK" comes back only after all in-sync copies have written |
| 14 | Send events (Terminal 3) | Normal day | Type `m1:kick-off`, `m2:kick-off` | Both appear in Terminal 4 |
| 14b | See the data in every copy (Terminal 1) | Did the copies really get the messages? | `D=$(docker exec client /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka1:9092 --describe --topic football); printf "%-8s %-12s %-8s %s\n" SERVER PARTITION ROLE MESSAGES; printf "%-8s %-12s %-8s %s\n" ------ --------- ---- --------; for p in 0 1; do for b in 1 2 3; do l=$(echo "$D" \| awk -v p=$p '$3=="Partition:" && $4==p {print $6}'); [ "$l" = "$b" ] && r=LEADER \|\| r=copy; m=$(docker exec kafka$b /opt/kafka/bin/kafka-dump-log.sh --files /tmp/kraft-combined-logs/football-$p/00000000000000000000.log --print-data-log \| awk '/payload:/{for(i=1;i<=NF;i++){if($i=="key:")k=$(i+1); if($i=="payload:")v=$(i+1)}; printf "%s:%s  ", k, v}'); printf "%-8s %-12s %-8s %s\n" kafka$b football-$p $r "$m"; done; echo; done` | A table: SERVER, PARTITION, ROLE (LEADER/copy), MESSAGES. Every copy shows the **same messages as its leader**. Reads each server's log file straight from disk. |
| 15 | Find partition 0's leader (Terminal 2) | Which server should we kill? | `./kafka-topics.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --describe --topic football 2>/dev/null \| awk 'BEGIN{printf "%-12s %-8s %-22s %s\n","PARTITION","LEADER","COPIES ON","IN SYNC (ISR)"} $3=="Partition:"{c=$8; s=$10; gsub(/[0-9]/,"kafka&",c); gsub(/[0-9]/,"kafka&",s); printf "%-12s %-8s %-22s %s\n","football-"$4,"kafka"$6,c,s}'` | Note **Leader** of Partition 0, e.g. `3` = kafka3 |
| 16 | Kill that leader (Terminal 1) | A server crashes | `docker stop kafka3` (use the number you noted) | Server is off |
| 17 | Describe again (Terminal 2) | Who took over? | `./kafka-topics.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --describe --topic football 2>/dev/null \| awk 'BEGIN{printf "%-12s %-8s %-22s %s\n","PARTITION","LEADER","COPIES ON","IN SYNC (ISR)"} $3=="Partition:"{c=$8; s=$10; gsub(/[0-9]/,"kafka&",c); gsub(/[0-9]/,"kafka&",s); printf "%-12s %-8s %-22s %s\n","football-"$4,"kafka"$6,c,s}'` | Partition 0 has a **new Leader**. **Isr** lost the dead server (e.g. `1,2`) |
| 18 | Send event (Terminal 3) | Does writing still work? | Type `m1:goal` | Works: 2 copies in sync ≥ min.insync 2. Terminal 4 receives it. **No data lost** |
| 19 | Bring it back (Terminal 1) | Server recovers | `docker start kafka3`, then wait ~15 seconds | It copies the messages it missed from the leader |
| 20 | Describe again (Terminal 2) | Back in sync | `./kafka-topics.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --describe --topic football 2>/dev/null \| awk 'BEGIN{printf "%-12s %-8s %-22s %s\n","PARTITION","LEADER","COPIES ON","IN SYNC (ISR)"} $3=="Partition:"{c=$8; s=$10; gsub(/[0-9]/,"kafka&",c); gsub(/[0-9]/,"kafka&",s); printf "%-12s %-8s %-22s %s\n","football-"$4,"kafka"$6,c,s}'` | **Isr** is 3 servers again |
| 20b | See the data in every copy (Terminal 1) | Did kafka2 catch up? | `D=$(docker exec client /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka1:9092 --describe --topic football); printf "%-8s %-12s %-8s %s\n" SERVER PARTITION ROLE MESSAGES; printf "%-8s %-12s %-8s %s\n" ------ --------- ---- --------; for p in 0 1; do for b in 1 2 3; do l=$(echo "$D" \| awk -v p=$p '$3=="Partition:" && $4==p {print $6}'); [ "$l" = "$b" ] && r=LEADER \|\| r=copy; m=$(docker exec kafka$b /opt/kafka/bin/kafka-dump-log.sh --files /tmp/kraft-combined-logs/football-$p/00000000000000000000.log --print-data-log \| awk '/payload:/{for(i=1;i<=NF;i++){if($i=="key:")k=$(i+1); if($i=="payload:")v=$(i+1)}; printf "%s:%s  ", k, v}'); printf "%-8s %-12s %-8s %s\n" kafka$b football-$p $r "$m"; done; echo; done` | kafka2's football-0 now also has **m1:goal**, the message it missed while it was down |
| 21 | Find active controller (Terminal 2) | Kill the manager now | `./kafka-metadata-quorum.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 describe --status` | Note **LeaderId**, e.g. `1` |
| 22 | Kill the controller (Terminal 1) | The manager crashes | `docker stop kafka1` (use the noted id) | — |
| 23 | Check controller (Terminal 2) | New manager elected | `./kafka-metadata-quorum.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 describe --status` | **LeaderId** is now another server. The 2 left voted |
| 24 | Bring it back (Terminal 1) | — | `docker start kafka1`, then wait ~15 seconds | — |
| 25 | Require all 3 copies (Terminal 2) | Change the rule: an acks=all write now needs all 3 copies alive (was 2), so we can show a refusal next | `./kafka-configs.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --alter --entity-type topics --entity-name football --add-config min.insync.replicas=3` | Now acks=all needs **all 3** copies in sync |
| 26 | Kill one server (Terminal 1) | Only 2 copies left | `docker stop kafka2` | — |
| 27 | Send with acks=all (Terminal 3) | Safety first | Type `m1:red-card` | Error: **NOT_ENOUGH_REPLICAS**. Kafka refuses the write rather than risk losing it. Terminal 4 gets nothing |
| 28 | Switch producer to acks=1 (Terminal 3) | Speed first | Ctrl+C, then `./kafka-console-producer.sh --bootstrap-server kafka1:9092,kafka2:9092,kafka3:9092 --topic football --property parse.key=true --property key.separator=: --producer-property acks=1` | "OK" as soon as the leader writes |
| 29 | Send with acks=1 (Terminal 3) | Leader alone says OK | Type `m1:yellow-card` | **No error**, but Terminal 4 shows **nothing**: Kafka hides it from consumers until enough copies have it |
| 30 | Bring kafka2 back (Terminal 1) | Copies catch up | `docker start kafka2`, then wait ~15 seconds | Now Terminal 4 prints **yellow-card** |
| 30b | See the data in every copy (Terminal 1) | Did the copy catch up? | `D=$(docker exec client /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka1:9092 --describe --topic football); printf "%-8s %-12s %-8s %s\n" SERVER PARTITION ROLE MESSAGES; printf "%-8s %-12s %-8s %s\n" ------ --------- ---- --------; for p in 0 1; do for b in 1 2 3; do l=$(echo "$D" \| awk -v p=$p '$3=="Partition:" && $4==p {print $6}'); [ "$l" = "$b" ] && r=LEADER \|\| r=copy; m=$(docker exec kafka$b /opt/kafka/bin/kafka-dump-log.sh --files /tmp/kraft-combined-logs/football-$p/00000000000000000000.log --print-data-log \| awk '/payload:/{for(i=1;i<=NF;i++){if($i=="key:")k=$(i+1); if($i=="payload:")v=$(i+1)}; printf "%s:%s  ", k, v}'); printf "%-8s %-12s %-8s %s\n" kafka$b football-$p $r "$m"; done; echo; done` | kafka2's football-0 now also has **m1:yellow-card**: copies match the leader again |
| 31 | Stop clients (Terminal 3, Terminal 4) | End | **Ctrl+C** in Terminal 3 and Terminal 4, then `exit` in Terminal 2, Terminal 3, Terminal 4 | Back on the Mac |
| 32 | Remove the cluster (Terminal 1) | Switch everything off | `docker compose down` | All 4 containers removed. The image stays |

---

## acks in one table

| acks | Producer gets "OK" when | Risk |
|---|---|---|
| 0 | immediately, never waits | message can be lost silently |
| 1 | the leader wrote it | lost if the leader dies before the copies have it |
| all | every in-sync copy wrote it (at least min.insync.replicas) | safest. Refused when not enough copies are alive |
