package com.studentbuddy.auth;

import com.studentbuddy.model.User;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class AuthService {

    private List<User> userList = new ArrayList<>();
    private User currentUser;
    private int userCounter = 1;

    public AuthService() {
        loadUsers();
    }

    public void register(String name, String email, String password) {

        for (User user : userList) {

            if (user.getEmail().equalsIgnoreCase(email)) {

                System.out.println("Email already registered.");
                return;
            }
        }

        User user = new User(userCounter++, name, email, password);

        userList.add(user);

        saveUsers();

        System.out.println("User registered successfully.");
    }

    public boolean login(String email, String password) {

        for (User user : userList) {

            if (user.getEmail().equalsIgnoreCase(email)
                    && user.getPassword().equals(password)) {

                currentUser = user;

                System.out.println("Login successful. Welcome " + user.getName());

                return true;
            }
        }

        System.out.println("Invalid email or password.");

        return false;
    }

    public void logout() {

        if (currentUser != null) {

            System.out.println("User " + currentUser.getName() + " logged out.");
        }

        currentUser = null;
    }

    public User getCurrentUser() {
        return currentUser;
    }

    private void saveUsers() {

        try (ObjectOutputStream out =
                     new ObjectOutputStream(new FileOutputStream("users.dat"))) {

            out.writeObject(userList);

        } catch (IOException e) {

            System.out.println("Error saving users.");
        }
    }

    @SuppressWarnings("unchecked")
    private void loadUsers() {

        try (ObjectInputStream in =
                     new ObjectInputStream(new FileInputStream("users.dat"))) {

            userList = (List<User>) in.readObject();

            if (!userList.isEmpty()) {

                userCounter = userList.get(userList.size() - 1).getUserId() + 1;
            }

        } catch (IOException | ClassNotFoundException e) {

            userList = new ArrayList<>();
        }
    }
}