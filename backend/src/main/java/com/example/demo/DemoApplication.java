package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
<<<<<<< HEAD
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @EnableScheduling activates the @Scheduled purgeExpiredRefreshTokens()
 * method in AuthController — runs every hour to clean up expired DB rows.
 */
@SpringBootApplication
@EnableScheduling
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
=======

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
}
