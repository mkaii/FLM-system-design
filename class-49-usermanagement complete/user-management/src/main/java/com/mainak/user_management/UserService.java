package com.mainak.user_management;

import java.util.ArrayList;
import java.util.List;

public class UserService {

    // source of the data
    private List<User> users = new ArrayList<>();

    public UserService() {
        users.add(new User(1, "John", 25));
        users.add(new User(2, "Alice", 30));
        users.add(new User(3, "Bob", 22));
    }

    public List<User> getAllUsers() {
        return users;
    }

    public User getUserById(int id) {

        for (User user : users) {

            if (user.getId() == id) {
                return user;
            }
        }

        return null;
    }

    public void addUser(User user) {
        users.add(user);
    }

    public void updateUser(int id, User updatedUser) {

        User u1 = getUserById(id);
        if (u1 != null) {
            deleteUser(id);
            addUser(updatedUser);
        }

    }

    public void deleteUser(int id) {

        for (int i = 0; i < users.size(); i++) {

            if (users.get(i).getId() == id) {
                users.remove(i);
                return;
            }
        }
    }

    public List<User> getUsersByAge(int age) {

        List<User> result = new ArrayList<>();

        for (User user : users) {

            if (user.getAge() == age) {
                result.add(user);
            }
        }

        return result;
    }
}
