package com.mainak.user_management;


import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {

    UserService userService = new  UserService();


    // GET /users
    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("users/{id}")
    public User getUser(@PathVariable int id) {
        return userService.getUserById(id);
    }


    @GetMapping("users/search")
    public List<User> searchUsers(@RequestParam int age) {
        return userService.getUsersByAge(age);
    }

    // add a user
    @PostMapping("/user")
    public void addUser(@RequestBody User user) {
        userService.addUser(user);
    }


    // update a user :
    @PutMapping("users/{id}")
    public void updateUser(@PathVariable int id,@RequestBody User user){
        userService.updateUser(id, user);
    }

    @DeleteMapping("users/{id}")
    public void deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
    }


}
