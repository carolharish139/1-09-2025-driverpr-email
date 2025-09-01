-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 01, 2025 at 01:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `newdriverproject`
--

-- --------------------------------------------------------

--
-- Table structure for table `availability`
--

CREATE TABLE `availability` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocks`
--

CREATE TABLE `blocks` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `description` varchar(255) DEFAULT 'סגור',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blocks`
--

INSERT INTO `blocks` (`id`, `date`, `start_time`, `end_time`, `description`, `created_at`) VALUES
(326, '2025-08-28', '08:00:00', '09:00:00', 'סגור', '2025-08-25 14:04:53'),
(327, '2025-08-28', '09:00:00', '10:00:00', 'סגור', '2025-08-25 14:04:53'),
(328, '2025-08-28', '10:00:00', '11:00:00', 'סגור', '2025-08-25 14:04:53'),
(329, '2025-08-28', '11:00:00', '12:00:00', 'סגור', '2025-08-25 14:04:53'),
(330, '2025-08-28', '12:00:00', '13:00:00', 'סגור', '2025-08-25 14:04:53'),
(331, '2025-08-28', '13:00:00', '14:00:00', 'סגור', '2025-08-25 14:04:53'),
(332, '2025-08-28', '14:00:00', '15:00:00', 'סגור', '2025-08-25 14:04:53'),
(333, '2025-08-28', '15:00:00', '16:00:00', 'סגור', '2025-08-25 14:04:53'),
(334, '2025-08-28', '16:00:00', '17:00:00', 'סגור', '2025-08-25 14:04:53'),
(335, '2025-08-28', '17:00:00', '18:00:00', 'סגור', '2025-08-25 14:04:53'),
(336, '2025-08-28', '18:00:00', '19:00:00', 'סגור', '2025-08-25 14:04:53'),
(337, '2025-08-28', '19:00:00', '20:00:00', 'סגור', '2025-08-25 14:04:53'),
(338, '2025-08-28', '20:00:00', '21:00:00', 'סגור', '2025-08-25 14:04:53');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `user_id`, `message`, `created_at`) VALUES
(14, 212394381, 'היום תאסוף אותי מהבית ספר,בבקשה', '2025-08-25 11:55:50');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `availability_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('scheduled','cancelled_by_student','cancelled_by_teacher','completed') NOT NULL DEFAULT 'scheduled',
  `date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `user_id`, `availability_id`, `created_at`, `status`, `date`, `start_time`, `end_time`) VALUES
(26, 888888888, NULL, '2025-08-17 15:16:52', 'scheduled', '2025-08-18', '12:00:00', '13:00:00'),
(27, 888888888, NULL, '2025-08-17 15:16:56', 'scheduled', '2025-08-19', '15:00:00', '16:00:00'),
(47, 212394381, NULL, '2025-08-25 12:01:51', 'cancelled_by_student', '2025-08-31', '10:00:00', '11:00:00'),
(48, 111111111, NULL, '2025-08-25 12:05:10', 'scheduled', '2025-08-25', '17:00:00', '18:00:00'),
(54, 212394381, NULL, '2025-08-25 14:02:20', 'cancelled_by_student', '2025-09-24', '09:00:00', '10:00:00'),
(55, 212394381, NULL, '2025-09-01 09:13:02', 'scheduled', '2025-09-01', '13:00:00', '14:00:00'),
(56, 888888888, NULL, '2025-09-01 09:13:49', 'scheduled', '2025-09-01', '14:00:00', '15:00:00'),
(57, 888888888, NULL, '2025-09-01 09:13:55', 'scheduled', '2025-09-02', '08:00:00', '09:00:00'),
(58, 888888888, NULL, '2025-09-01 09:14:01', 'scheduled', '2025-09-03', '10:00:00', '11:00:00'),
(59, 333333333, NULL, '2025-09-01 09:14:46', 'scheduled', '2025-09-01', '15:00:00', '16:00:00'),
(60, 333333333, NULL, '2025-09-01 09:15:09', 'scheduled', '2025-09-04', '19:00:00', '20:00:00'),
(62, 333333333, NULL, '2025-09-01 09:15:29', 'scheduled', '2025-09-03', '15:00:00', '16:00:00'),
(63, 111111111, NULL, '2025-09-01 09:15:53', 'scheduled', '2025-09-01', '16:00:00', '17:00:00'),
(64, 111111111, NULL, '2025-09-01 09:15:59', 'scheduled', '2025-09-02', '11:00:00', '12:00:00'),
(65, 111111111, NULL, '2025-09-01 09:16:05', 'scheduled', '2025-09-03', '13:00:00', '14:00:00'),
(66, 111111111, NULL, '2025-09-01 09:16:11', 'scheduled', '2025-09-04', '18:00:00', '19:00:00'),
(67, 212394381, NULL, '2025-09-01 09:37:08', 'scheduled', '2025-09-09', '18:00:00', '19:00:00'),
(68, 212394381, NULL, '2025-09-01 09:50:57', 'scheduled', '2025-09-15', '10:00:00', '11:00:00'),
(69, 212394381, NULL, '2025-09-01 10:23:51', 'cancelled_by_student', '2025-09-24', '19:00:00', '20:00:00'),
(70, 212394381, NULL, '2025-09-01 10:24:05', 'cancelled_by_student', '2025-09-29', '20:00:00', '21:00:00'),
(71, 212394381, NULL, '2025-09-01 10:24:45', 'scheduled', '2025-09-02', '12:00:00', '13:00:00'),
(72, 212394381, NULL, '2025-09-01 10:24:50', 'scheduled', '2025-09-03', '12:00:00', '13:00:00'),
(73, 212394381, NULL, '2025-09-01 10:24:53', 'scheduled', '2025-09-04', '13:00:00', '14:00:00'),
(74, 212394381, NULL, '2025-09-01 10:25:01', 'scheduled', '2025-09-07', '18:00:00', '19:00:00'),
(75, 555555555, NULL, '2025-09-01 11:19:45', 'scheduled', '2025-09-01', '17:00:00', '18:00:00'),
(76, 555555555, NULL, '2025-09-01 11:19:47', 'scheduled', '2025-09-02', '13:00:00', '14:00:00'),
(77, 555555555, NULL, '2025-09-01 11:19:52', 'scheduled', '2025-09-09', '19:00:00', '20:00:00'),
(78, 555555555, NULL, '2025-09-01 11:19:55', 'scheduled', '2025-09-03', '09:00:00', '10:00:00'),
(79, 555555555, NULL, '2025-09-01 11:19:58', 'scheduled', '2025-09-04', '09:00:00', '10:00:00'),
(80, 555555555, NULL, '2025-09-01 11:20:03', 'cancelled_by_student', '2025-09-14', '11:00:00', '12:00:00'),
(81, 555555555, NULL, '2025-09-01 11:20:33', 'cancelled_by_teacher', '2025-09-14', '18:00:00', '19:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_blocks`
--

CREATE TABLE `teacher_blocks` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT 1,
  `date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_full_day` tinyint(1) DEFAULT 0,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_blocks`
--

INSERT INTO `teacher_blocks` (`id`, `teacher_id`, `date`, `start_time`, `end_time`, `is_full_day`, `reason`, `created_at`) VALUES
(3, 1, '2025-08-20', '12:00:00', '13:00:00', 0, NULL, '2025-08-10 15:38:00'),
(4, 1, '2025-08-20', '13:00:00', '14:00:00', 0, NULL, '2025-08-10 15:38:01'),
(7, 1, '2025-08-10', '10:00:00', '11:00:00', 0, NULL, '2025-08-10 16:12:39'),
(8, 1, '2025-08-21', '11:00:00', '12:00:00', 0, NULL, '2025-08-10 16:18:49'),
(9, 1, '2025-08-21', '12:00:00', '13:00:00', 0, NULL, '2025-08-10 16:18:50'),
(10, 1, '2025-08-21', '13:00:00', '14:00:00', 0, NULL, '2025-08-10 16:18:54'),
(11, 1, '2025-08-21', NULL, NULL, 1, NULL, '2025-08-10 16:19:48'),
(13, 1, '2025-08-10', '19:00:00', '20:00:00', 0, NULL, '2025-08-10 16:24:03'),
(14, 1, '2025-08-10', '11:00:00', '12:00:00', 0, NULL, '2025-08-10 16:37:39'),
(15, 1, '2025-08-10', '18:00:00', '19:00:00', 0, NULL, '2025-08-10 16:37:42'),
(17, 1, '2025-08-20', '11:00:00', '12:00:00', 0, NULL, '2025-08-10 16:37:55');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `phone`, `password`, `birth_date`, `address`, `role`) VALUES
(111111111, 'קרול', 'car@gmail.com', '0539482882', '$2b$10$rLlHtRn71Dm2U4rI.e.YHO2eCFSINuXWVGkcqmfljEYrE.y0RyNyG', '2025-08-25', 'השלום', 'student'),
(123456789, 'Admin', 'carolharish.ch@gmail.com', '0500000000', '$2b$10$m/jrC5UC3MIVe5kN1.esI.ZD3rBayso4VDyZ/SIIxZz6kGUBTL9ka', '1980-01-01', 'Admin HQ', 'admin'),
(212394381, 'קרול חריש', 'carol@gmail.com', '0509474999', '$2b$10$IzJnj/fSzw/zk8p32aZaLupTJy.kXq0TzpH06sW97oGdIuAItVjti', '2025-08-03', 'hashalom', 'student'),
(333333333, 'חריש', 'harish@gmail.com', '0509283772', '$2b$10$400BsXR2XsuFu7YfsAs02eiTt0p0tKRXsGZLzL4TDwQFRCniO9Xyq', '2025-08-06', 'hajs', 'student'),
(555555555, 'נדין משיעל', 'nadin.misheal2005@gmail.com', '0533350750', '$2b$10$sIwown3TQVxrbWeW5wJvCOGfZSq6vgLk/uA8Y0zuBtwsKr7ZlhyzO', '2005-01-20', 'קדושי יאסי 53', 'student'),
(888888888, 'mor', 'mor@gmail.com', '0503748371', '$2b$10$gTFaHd0V2o0OA8oBTRfmu.bnkAoju1GUdQnQDJ8iMQyxS4hNCF8SK', '2025-08-05', 'hah', 'student');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `availability`
--
ALTER TABLE `availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_avl` (`teacher_id`,`date`,`start_time`,`end_time`);

--
-- Indexes for table `blocks`
--
ALTER TABLE `blocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_block` (`date`,`start_time`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_lesson_slot` (`date`,`start_time`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_avl` (`availability_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `teacher_blocks`
--
ALTER TABLE `teacher_blocks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `availability`
--
ALTER TABLE `availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT for table `blocks`
--
ALTER TABLE `blocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=379;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `teacher_blocks`
--
ALTER TABLE `teacher_blocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000000000;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `availability`
--
ALTER TABLE `availability`
  ADD CONSTRAINT `availability_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `availability_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
