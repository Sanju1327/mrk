-- ==========================================
-- CodeCraft — Database Migration V3: Production Course & Content Seed Data
-- ==========================================

-- 1. Insert Course
INSERT INTO courses (id, title, slug, description, icon_url, level, is_published, display_order, created_at, updated_at) VALUES
(1, 'Java Foundations & Object-Oriented Programming', 'java-foundations', 'Master modern Java 21 syntax, memory management, object-oriented design, data structures, and algorithmic problem solving.', 'code-2', 'BEGINNER', TRUE, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 2. Insert Topics for Course 1
INSERT INTO topics (id, course_id, title, slug, description, display_order, created_at, updated_at) VALUES
(1, 1, 'Java Syntax, Variables & Control Flow', 'java-basics', 'Core fundamentals: JDK, primitive data types, conditionals, loops, and standard I/O.', 1, NOW(), NOW()),
(2, 1, 'Arrays, Strings & Memory Mechanics', 'arrays-and-strings', 'Working with sequential memory structures, immutable strings, and algorithmic operations.', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 3. Insert Lessons
INSERT INTO lessons (id, topic_id, title, slug, content_markdown, estimated_minutes, display_order, created_at, updated_at) VALUES
(1, 1, 'Introduction to Java 21 & The JVM', 'intro-to-java', 
'# Introduction to Java 21 & The JVM

Java is a strongly typed, class-based, object-oriented programming language designed to have as few implementation dependencies as possible (**"Write Once, Run Anywhere"**).

## The Java Execution Pipeline
When you compile a Java source file:
1. `javac` compiles `Solution.java` into bytecode `Solution.class`.
2. The **Java Virtual Machine (JVM)** interprets and Just-In-Time (JIT) compiles the bytecode into native machine instructions.

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Welcome to CodeCraft!");
    }
}
```

## Primitive Data Types in Java
- `int` (32-bit signed integer: -2^31 to 2^31 - 1)
- `long` (64-bit signed integer)
- `double` (64-bit floating point)
- `boolean` (`true` or `false`)
- `char` (16-bit Unicode character)
', 10, 1, NOW(), NOW()),

(2, 1, 'Conditionals & Loops in Java', 'conditionals-and-loops',
'# Conditionals and Loop Structures

Control flow statements break up the flow of execution by employing decision making, looping, and branching.

## If-Else Ladder & Switch Expressions
```java
int score = 85;
if (score >= 90) {
    System.out.println("Grade: A");
} else if (score >= 80) {
    System.out.println("Grade: B");
} else {
    System.out.println("Grade: C");
}
```

## Modern For-Each Loop
```java
int[] numbers = {10, 20, 30, 40, 50};
for (int num : numbers) {
    System.out.println("Value: " + num);
}
```
', 12, 2, NOW(), NOW()),

(3, 2, 'Array Traversal and Memory Layout', 'arrays-in-java',
'# Arrays and Sequential Data in Java

An array is a container object that holds a fixed number of values of a single type. The length of an array is established when the array is created.

```java
// Declaration & Initialization
int[] nums = new int[5];
int[] initialized = {2, 7, 11, 15};

// Finding array length
int len = initialized.length; // 4
```

## Array Time Complexity
- Access by Index: $O(1)$
- Search (Unsorted): $O(n)$
- Insertion/Deletion: $O(n)$ (shifting elements)
', 15, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Insert Coding Problems
INSERT INTO problems (id, topic_id, title, slug, description, constraints, difficulty, supported_language, time_limit_ms, memory_limit_mb, starter_code, explanation, is_daily_challenge, created_at, updated_at) VALUES
(1, 2, 'Two Sum', 'two-sum',
'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.',
'• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.',
'EASY', 'JAVA', 2000, 256,
'import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Implement your solution
        return new int[]{};
    }
}',
'Optimal Solution: Use a HashMap to store values and their indices. For each element nums[i], check if (target - nums[i]) exists in the map in O(1) average time. Total Time: O(n), Space: O(n).',
TRUE, NOW(), NOW()),

(2, 2, 'Valid Palindrome', 'valid-palindrome',
'A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
'• 1 <= s.length <= 2 * 10^5
• s consists only of printable ASCII characters.',
'EASY', 'JAVA', 2000, 256,
'public class Solution {
    public boolean isPalindrome(String s) {
        // Implement your solution
        return false;
    }
}',
'Optimal Solution: Use two pointers (left and right), moving inward while skipping non-alphanumeric characters with Character.isLetterOrDigit(), and comparing lowercase characters.',
FALSE, NOW(), NOW()),

(3, 1, 'FizzBuzz', 'fizz-buzz',
'Given an integer `n`, return a string array `answer` (1-indexed) where:
- `answer[i] == "FizzBuzz"` if `i` is divisible by 3 and 5.
- `answer[i] == "Fizz"` if `i` is divisible by 3.
- `answer[i] == "Buzz"` if `i` is divisible by 5.
- `answer[i] == Integer.toString(i)` if none of the above conditions are true.',
'• 1 <= n <= 10^4',
'EASY', 'JAVA', 2000, 256,
'import java.util.List;
import java.util.ArrayList;

public class Solution {
    public List<String> fizzBuzz(int n) {
        // Implement your solution
        return new ArrayList<>();
    }
}',
'Iterate from 1 to n. Check if i % 15 == 0 first, then i % 3 == 0, then i % 5 == 0, else convert to string.',
FALSE, NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. Insert Test Cases for Problems
-- Test Cases for Problem 1 (Two Sum)
INSERT INTO test_cases (id, problem_id, input_data, expected_output, is_sample, is_hidden, explanation, display_order) VALUES
(1, 1, '[2,7,11,15]\n9', '[0,1]', TRUE, FALSE, 'nums[0] + nums[1] == 2 + 7 == 9, so return [0, 1].', 1),
(2, 1, '[3,2,4]\n6', '[1,2]', TRUE, FALSE, 'nums[1] + nums[2] == 2 + 4 == 6, so return [1, 2].', 2),
(3, 1, '[3,3]\n6', '[0,1]', FALSE, TRUE, 'Hidden edge case with duplicate values.', 3),
(4, 1, '[-1,-2,-3,-4,-5]\n-8', '[2,4]', FALSE, TRUE, 'Hidden case with negative integers.', 4)
ON DUPLICATE KEY UPDATE input_data=VALUES(input_data);

-- Test Cases for Problem 2 (Valid Palindrome)
INSERT INTO test_cases (id, problem_id, input_data, expected_output, is_sample, is_hidden, explanation, display_order) VALUES
(5, 2, '"A man, a plan, a canal: Panama"', 'true', TRUE, FALSE, '"amanaplanacanalpanama" is a palindrome.', 1),
(6, 2, '"race a car"', 'false', TRUE, FALSE, '"raceacar" is not a palindrome.', 2),
(7, 2, '" "', 'true', FALSE, TRUE, 'Empty or whitespace string is palindrome after removing non-alphanumeric chars.', 3)
ON DUPLICATE KEY UPDATE input_data=VALUES(input_data);

-- Test Cases for Problem 3 (FizzBuzz)
INSERT INTO test_cases (id, problem_id, input_data, expected_output, is_sample, is_hidden, explanation, display_order) VALUES
(8, 3, '3', '["1","2","Fizz"]', TRUE, FALSE, 'Numbers up to 3.', 1),
(9, 3, '5', '["1","2","Fizz","4","Buzz"]', TRUE, FALSE, 'Numbers up to 5.', 2),
(10, 3, '15', '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', FALSE, TRUE, 'Tests FizzBuzz combination at 15.', 3)
ON DUPLICATE KEY UPDATE input_data=VALUES(input_data);

-- 6. Insert Quiz for Topic 1
INSERT INTO quizzes (id, topic_id, title, description, time_limit_minutes, passing_score_percentage, created_at, updated_at) VALUES
(1, 1, 'Java Basics & Fundamentals Assessment', 'Test your understanding of Java 21 data types, operators, JVM mechanics, and control structures.', 10, 70, NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. Insert Questions for Quiz 1
INSERT INTO questions (id, quiz_id, question_text, question_type, points, explanation, display_order) VALUES
(1, 1, 'Which of the following components in the Java architecture executes Java bytecode directly?', 'SINGLE_CHOICE', 10, 'The Java Virtual Machine (JVM) interprets and compiles bytecode into machine language.', 1),
(2, 1, 'What is the default value of an uninitialized boolean instance variable in Java?', 'SINGLE_CHOICE', 10, 'In Java, boolean instance variables default to false.', 2),
(3, 1, 'Which primitive type in Java occupies 64 bits of memory?', 'SINGLE_CHOICE', 10, 'Both long (integer) and double (floating point) occupy 64 bits (8 bytes) in Java.', 3)
ON DUPLICATE KEY UPDATE question_text=VALUES(question_text);

-- 8. Insert Options for Questions
-- Question 1 Options
INSERT INTO question_options (id, question_id, option_text, is_correct, display_order) VALUES
(1, 1, 'Java Compiler (javac)', FALSE, 1),
(2, 1, 'Java Virtual Machine (JVM)', TRUE, 2),
(3, 1, 'Java Development Kit (JDK)', FALSE, 3),
(4, 1, 'Java ClassLoader only', FALSE, 4),

-- Question 2 Options
(5, 2, 'true', FALSE, 1),
(6, 2, 'false', TRUE, 2),
(7, 2, 'null', FALSE, 3),
(8, 2, '0', FALSE, 4),

-- Question 3 Options
(9, 3, 'int', FALSE, 1),
(10, 3, 'float', FALSE, 2),
(11, 3, 'long', TRUE, 3),
(12, 3, 'short', FALSE, 4)
ON DUPLICATE KEY UPDATE option_text=VALUES(option_text);
