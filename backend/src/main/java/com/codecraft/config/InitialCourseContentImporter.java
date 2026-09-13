package com.codecraft.config;

import com.codecraft.domain.course.entity.*;
import com.codecraft.domain.course.repository.*;
import com.codecraft.domain.problem.entity.Difficulty;
import com.codecraft.domain.problem.entity.Problem;
import com.codecraft.domain.problem.entity.TestCase;
import com.codecraft.domain.problem.repository.ProblemRepository;
import com.codecraft.domain.quiz.entity.Question;
import com.codecraft.domain.quiz.entity.QuestionOption;
import com.codecraft.domain.quiz.entity.QuestionType;
import com.codecraft.domain.quiz.entity.Quiz;
import com.codecraft.domain.quiz.repository.QuizRepository;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class InitialCourseContentImporter implements ApplicationRunner {

    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final ContentBlockRepository contentBlockRepository;
    private final CourseResourceRepository courseResourceRepository;
    private final QuizRepository quizRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (courseRepository.existsBySlug("java-basics")) {
            log.info("Production courses already present. Skipping initial curriculum import.");
            return;
        }

        User instructor = userRepository.findByEmail("Sanju@gmail.com")
                .or(() -> userRepository.findByRolesName("ROLE_SUPER_ADMIN").stream().findFirst())
                .or(() -> userRepository.findAll().stream().findFirst())
                .orElse(null);

        if (instructor == null) {
            log.warn("No instructor account available for course ownership. Skipping course population.");
            return;
        }

        log.info("Starting initial 7-course curriculum import attributed to instructor: {}", instructor.getFullName());

        // 1. Java Basics
        createJavaBasicsCourse(instructor);

        // 2. HTML, CSS & JavaScript
        createWebDevCourse(instructor);

        // 3. Python Basics
        createPythonBasicsCourse(instructor);

        // 4. React Fundamentals
        createReactFundamentalsCourse(instructor);

        // 5. React Basics (Hands-on / Projects)
        createReactBasicsCourse(instructor);

        // 6. React Native
        createReactNativeCourse(instructor);

        // 7. MySQL
        createMySqlCourse(instructor);

        log.info("Successfully imported all 7 educational courses into live MySQL database.");
    }

    // ==========================================
    // 1. JAVA BASICS
    // ==========================================
    private void createJavaBasicsCourse(User instructor) {
        Course course = Course.builder()
                .title("Java Basics")
                .slug("java-basics")
                .description("A complete introduction to modern Java 21 programming: syntax, object-oriented concepts, exception handling, and data structures with official dev.java documentation and hands-on exercises.")
                .category("Backend & Systems")
                .level(CourseLevel.BEGINNER)
                .estimatedDuration("6 weeks")
                .iconUrl("code-2")
                .teacher(instructor)
                .status(CourseStatus.PUBLISHED)
                .published(true)
                .publishedAt(LocalDateTime.now())
                .displayOrder(1)
                .build();
        courseRepository.save(course);

        // Topic 1: Java Foundations & Setup
        Topic t1 = createTopic(course, "Module 1 — Java Foundations & Environment", "java-intro-setup", "Introduction to the JVM, JDK 21 installation, and your first Java program.", 1);
        Lesson l1 = createLesson(t1, "Introduction to Java & The JVM", "intro-to-java-jvm", 15, 1);
        addBlock(l1, ContentType.TEXT, "Overview of Java", "# Introduction to Java\nJava is a class-based, object-oriented language designed with the **'Write Once, Run Anywhere'** philosophy. Bytecode compiles via `javac` and executes on the **Java Virtual Machine (JVM)**.", 1);
        addBlock(l1, ContentType.VIDEO, "Java Full Course for Beginners", "", "{\"videoId\":\"xk4_1vDrzzo\",\"provider\":\"YouTube\",\"attribution\":\"Bro Code\",\"url\":\"https://www.youtube.com/watch?v=xk4_1vDrzzo\"}", 2);
        addBlock(l1, ContentType.LINK, "Official Java Tutorials (dev.java)", "Explore foundational tutorials and language guides on the official Java developer portal.", "{\"url\":\"https://dev.java/learn/\",\"provider\":\"Oracle dev.java\"}", 3);
        addBlock(l1, ContentType.QUESTION, "Concept Check: JVM", "What does JVM stand for, and what is its primary role?", "{\"options\":[\"Java Virtual Machine - executes Java bytecode\",\"Java Variable Method - stores code pointers\",\"Joint Virtual Module - compiles C code\",\"Java Verified Memory - hardware cache\"],\"correctIndex\":0}", 4);

        Lesson l2 = createLesson(t1, "Installing JDK 21 & Setting Up Your IDE", "installing-jdk21", 15, 2);
        addBlock(l2, ContentType.TEXT, "Setting up Development Environment", "Download and install OpenJDK 21 or Eclipse Temurin. Verify your setup in your terminal with `java -version` and `javac -version`.", 1);

        Lesson l3 = createLesson(t1, "First Java Program & Standard I/O", "first-java-program", 20, 3);
        addBlock(l3, ContentType.CODE, "Hello World Example", "public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Welcome to CodeCraft!\");\n    }\n}", "{\"language\":\"java\"}", 1);

        // Topic 2: Variables, Types & Control Flow
        Topic t2 = createTopic(course, "Module 2 — Variables, Data Types & Control Flow", "java-types-control-flow", "Primitives, arithmetic and logical operators, if-else, switch, and loops.", 2);
        Lesson l4 = createLesson(t2, "Variables & Primitive Types", "java-variables-primitives", 20, 1);
        addBlock(l4, ContentType.TEXT, "Primitive Data Types in Java", "Java features 8 primitives: `byte`, `short`, `int`, `long`, `float`, `double`, `boolean`, and `char`.", 1);
        addBlock(l4, ContentType.QUESTION, "Constant Declaration in Java", "Which keyword is used to declare an unchangeable constant in Java?", "{\"options\":[\"const\",\"static\",\"final\",\"immutable\"],\"correctIndex\":2}", 2);

        Lesson l5 = createLesson(t2, "Conditionals & Control Flow", "java-conditionals", 20, 2);
        addBlock(l5, ContentType.TEXT, "Branching with if-else and switch", "Control execution flow using `if-else` chains and modern pattern-matching `switch` statements.", 1);

        Lesson l6 = createLesson(t2, "Loops & Iterations", "java-loops-iterations", 20, 3);
        addBlock(l6, ContentType.TEXT, "While, Do-While, and For Loops", "Iterate over collections and sequences using `for`, enhanced `for-each`, and `while` loops.", 1);

        // Topic 3: Object-Oriented Programming (OOP)
        Topic t3 = createTopic(course, "Module 3 — Object-Oriented Programming", "java-oop-fundamentals", "Classes, objects, constructors, encapsulation, inheritance, and polymorphism.", 3);
        Lesson l7 = createLesson(t3, "Classes, Objects & Constructors", "classes-objects-constructors", 25, 1);
        addBlock(l7, ContentType.TEXT, "Classes & Instantiation", "A class is a blueprint; an object is an instance allocated on the heap with its own state.", 1);

        Lesson l8 = createLesson(t3, "Inheritance & Polymorphism", "inheritance-polymorphism", 25, 2);
        addBlock(l8, ContentType.TEXT, "Extending Classes and Method Overriding", "Reuse functionality through inheritance using the `extends` keyword and override methods using `@Override`.", 1);

        // Quiz for Java Basics
        createQuizForTopic(t2, "Java Language Fundamentals Quiz", "Test your understanding of Java variables, primitives, and control flow.", 15, 70, List.of(
                new QData("Which of the following is NOT a Java primitive type?", List.of(new OData("int", false), new OData("String", true), new OData("boolean", false), new OData("double", false)), "String is a class reference type, not a primitive."),
                new QData("What is the default value of a boolean variable in a class?", List.of(new OData("false", true), new OData("true", false), new OData("null", false), new OData("0", false)), "Boolean fields default to false in Java.")
        ));

        // Coding Problem for Java Basics
        createProblem(course, t2, "Two Sum in Java", "java-two-sum",
                "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.",
                "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
                Difficulty.EASY, "JAVA",
                "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}",
                instructor,
                List.of(
                        new TCData("[2,7,11,15]\n9", "[0,1]", true, false),
                        new TCData("[3,2,4]\n6", "[1,2]", true, false),
                        new TCData("[3,3]\n6", "[0,1]", false, true)
                )
        );
    }

    // ==========================================
    // 2. HTML, CSS & JAVASCRIPT
    // ==========================================
    private void createWebDevCourse(User instructor) {
        Course course = Course.builder()
                .title("HTML, CSS & JavaScript")
                .slug("html-css-javascript")
                .description("Comprehensive web development track covering semantic HTML5, modern CSS layouts (Flexbox & Grid), responsive design, and core JavaScript DOM programming with MDN Web Docs and Apna College video tutorials.")
                .category("Web Development")
                .level(CourseLevel.BEGINNER)
                .estimatedDuration("8 weeks")
                .iconUrl("globe")
                .teacher(instructor)
                .status(CourseStatus.PUBLISHED)
                .published(true)
                .publishedAt(LocalDateTime.now())
                .displayOrder(2)
                .build();
        courseRepository.save(course);

        // Topic 1: HTML5 Architecture
        Topic t1 = createTopic(course, "Module 1 — HTML5 Semantic Document Structure", "html5-document-structure", "Document skeleton, tags, forms, tables, and web accessibility.", 1);
        Lesson l1 = createLesson(t1, "HTML Basics & Document Structure", "html-basics-document-structure", 15, 1);
        addBlock(l1, ContentType.TEXT, "Semantic HTML5", "# Semantic HTML5\nUsing elements like `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>` establishes structural hierarchy and improves accessibility for assistive technologies.", 1);
        addBlock(l1, ContentType.VIDEO, "HTML Full Course — Apna College", "", "{\"videoId\":\"HcOc7P5BMi4\",\"provider\":\"YouTube\",\"attribution\":\"Apna College\",\"url\":\"https://www.youtube.com/watch?v=HcOc7P5BMi4\"}", 2);
        addBlock(l1, ContentType.LINK, "MDN Web Docs — Learn HTML", "Official Mozilla Developer Network learning roadmap for HTML fundamentals.", "{\"url\":\"https://developer.mozilla.org/en-US/docs/Learn/HTML\",\"provider\":\"MDN Web Docs\"}", 3);
        addBlock(l1, ContentType.QUESTION, "HTML Semantic Elements", "Which HTML element represents the primary navigation links of a website?", "{\"options\":[\"<nav>\",\"<menu>\",\"<header>\",\"<links>\"],\"correctIndex\":0}", 4);

        Lesson l2 = createLesson(t1, "Forms, Inputs & Form Validation", "html-forms-validation", 20, 2);
        addBlock(l2, ContentType.TEXT, "Building Interactive Forms", "Use `<form>`, `<input>`, `<label>`, `<select>`, and `<textarea>` with built-in validation attributes like `required`, `minlength`, and `pattern`.", 1);

        // Topic 2: Modern CSS & Layouts
        Topic t2 = createTopic(course, "Module 2 — Modern CSS, Flexbox & Grid", "css-styling-layouts", "CSS Box Model, Flexbox, CSS Grid, and responsive media queries.", 2);
        Lesson l3 = createLesson(t2, "The CSS Box Model & Selectors", "css-box-model-selectors", 20, 1);
        addBlock(l3, ContentType.TEXT, "Box Model Fundamentals", "Every element is a box composed of: Content, Padding, Border, and Margin. Use `box-sizing: border-box` to include padding and borders within dimensions.", 1);
        addBlock(l3, ContentType.VIDEO, "CSS Full Course — Apna College", "", "{\"videoId\":\"ESnrn1kAD4E\",\"provider\":\"YouTube\",\"attribution\":\"Apna College\",\"url\":\"https://www.youtube.com/watch?v=ESnrn1kAD4E\"}", 2);
        addBlock(l3, ContentType.LINK, "MDN Web Docs — CSS Layouts", "Comprehensive MDN guide to Flexbox, Grid, and positioning.", "{\"url\":\"https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout\",\"provider\":\"MDN Web Docs\"}", 3);

        Lesson l4 = createLesson(t2, "Flexbox & CSS Grid Layouts", "css-flexbox-grid", 25, 2);
        addBlock(l4, ContentType.TEXT, "Flexbox vs Grid", "Use **Flexbox** for one-dimensional layouts (rows or columns) and **CSS Grid** for two-dimensional grid layouts.", 1);

        // Topic 3: Modern JavaScript & DOM
        Topic t3 = createTopic(course, "Module 3 — JavaScript Programming & DOM", "javascript-dom-events", "ES6+ features, functions, DOM manipulation, event listeners, and Fetch API.", 3);
        Lesson l5 = createLesson(t3, "JavaScript Syntax & ES6+ Features", "js-syntax-es6", 20, 1);
        addBlock(l5, ContentType.TEXT, "Variables & Scope", "Prefer `const` and `let` over `var` to enforce block scoping and prevent accidental reassignments.", 1);
        addBlock(l5, ContentType.VIDEO, "JavaScript Full Course — Apna College", "", "{\"videoId\":\"ajdRvxDWH4w\",\"provider\":\"YouTube\",\"attribution\":\"Apna College\",\"url\":\"https://www.youtube.com/watch?v=ajdRvxDWH4w\"}", 2);

        Lesson l6 = createLesson(t3, "DOM Manipulation & Event Handling", "js-dom-events", 25, 2);
        addBlock(l6, ContentType.TEXT, "Querying and Updating the DOM", "Use `document.querySelector()` and `addEventListener()` to make pages responsive to user clicks, keyboard inputs, and form events.", 1);

        // Quiz for Web Dev
        createQuizForTopic(t1, "HTML5 & Semantic Web Assessment", "Verify your mastery of document semantics and forms.", 10, 70, List.of(
                new QData("Which HTML attribute ensures an input field must be filled before submission?", List.of(new OData("required", true), new OData("mandatory", false), new OData("validate", false), new OData("strict", false)), "The 'required' attribute triggers native browser form validation."),
                new QData("In CSS, what is the effect of 'box-sizing: border-box'?", List.of(new OData("Padding and border are included in the element total width and height", true), new OData("Margins collapse automatically", false), new OData("The box is hidden from screen readers", false)), "Border-box simplifies sizing calculations.")
        ));
    }

    // ==========================================
    // 3. PYTHON BASICS
    // ==========================================
    private void createPythonBasicsCourse(User instructor) {
        Course course = Course.builder()
                .title("Python Basics")
                .slug("python-basics")
                .description("Beginner-friendly course covering Python 3 syntax, data structures (lists, tuples, dicts, sets), control flow, functions, file I/O, and OOP with official Python documentation.")
                .category("Programming")
                .level(CourseLevel.BEGINNER)
                .estimatedDuration("6 weeks")
                .iconUrl("terminal")
                .teacher(instructor)
                .status(CourseStatus.PUBLISHED)
                .published(true)
                .publishedAt(LocalDateTime.now())
                .displayOrder(3)
                .build();
        courseRepository.save(course);

        Topic t1 = createTopic(course, "Module 1 — Python Introduction & Syntax", "python-syntax-basics", "Python setup, dynamic variables, operators, and basic I/O.", 1);
        Lesson l1 = createLesson(t1, "Introduction to Python & Setup", "intro-to-python", 15, 1);
        addBlock(l1, ContentType.TEXT, "Why Python?", "Python is a high-level, interpreted language emphasizing readability and developer productivity.", 1);
        addBlock(l1, ContentType.VIDEO, "Python Full Course for Beginners", "", "{\"videoId\":\"_uQrJ0TkZlc\",\"provider\":\"YouTube\",\"attribution\":\"Programming with Mosh\",\"url\":\"https://www.youtube.com/watch?v=_uQrJ0TkZlc\"}", 2);
        addBlock(l1, ContentType.LINK, "Official Python 3 Documentation", "Explore the official Python language tutorial and standard library reference.", "{\"url\":\"https://docs.python.org/3/tutorial/\",\"provider\":\"Python Software Foundation\"}", 3);

        Topic t2 = createTopic(course, "Module 2 — Data Structures & Functions", "python-data-structures", "Lists, dictionaries, tuples, sets, list comprehensions, and functions.", 2);
        Lesson l2 = createLesson(t2, "Lists, Tuples & Dictionaries", "python-collections", 25, 1);
        addBlock(l2, ContentType.TEXT, "Core Collections in Python", "Lists are ordered and mutable; tuples are immutable; dictionaries store key-value mappings; sets contain unique elements.", 1);

        createQuizForTopic(t1, "Python Syntax & Basics Quiz", "Test Python foundational knowledge.", 10, 70, List.of(
                new QData("How do you create a function in Python?", List.of(new OData("def my_func():", true), new OData("function my_func()", false), new OData("func my_func():", false)), "Functions are defined with the 'def' keyword.")
        ));
    }

    // ==========================================
    // 4. REACT FUNDAMENTALS
    // ==========================================
    private void createReactFundamentalsCourse(User instructor) {
        Course course = Course.builder()
                .title("React Fundamentals")
                .slug("react-fundamentals")
                .description("Master the core concepts of React: declarative UI, JSX, components, props, state immutability, hooks (useState, useEffect), and state lifting based on the official react.dev documentation.")
                .category("Frontend Frameworks")
                .level(CourseLevel.INTERMEDIATE)
                .estimatedDuration("5 weeks")
                .iconUrl("layers")
                .teacher(instructor)
                .status(CourseStatus.PUBLISHED)
                .published(true)
                .publishedAt(LocalDateTime.now())
                .displayOrder(4)
                .build();
        courseRepository.save(course);

        Topic t1 = createTopic(course, "Module 1 — Components, JSX & Props", "react-components-jsx-props", "Declarative UI rendering, JSX rules, and unidirectional data flow.", 1);
        Lesson l1 = createLesson(t1, "What is React & Declarative UI?", "react-declarative-ui", 20, 1);
        addBlock(l1, ContentType.TEXT, "Declarative vs Imperative", "In React, you describe **what** the UI should look like for a given state, and React handles the DOM mutations efficiently.", 1);
        addBlock(l1, ContentType.VIDEO, "React Tutorial for Beginners", "", "{\"videoId\":\"SqcY0GlETPk\",\"provider\":\"YouTube\",\"attribution\":\"Programming with Mosh\",\"url\":\"https://www.youtube.com/watch?v=SqcY0GlETPk\"}", 2);
        addBlock(l1, ContentType.LINK, "React Official Documentation — react.dev", "The official new React documentation covering thinking in React and interactive components.", "{\"url\":\"https://react.dev/learn\",\"provider\":\"React Team / Meta\"}", 3);

        Topic t2 = createTopic(course, "Module 2 — State, Lifecycle & Hooks", "react-state-hooks", "useState, useEffect, event handling, and conditional rendering.", 2);
        Lesson l2 = createLesson(t2, "State Mechanics with useState", "react-usestate-hook", 25, 1);
        addBlock(l2, ContentType.TEXT, "Preserving Data Across Renders", "State is component memory. Calling `setCount(prev => prev + 1)` triggers a re-render with updated state.", 1);
    }

    // ==========================================
    // 5. REACT BASICS (PROJECT-ORIENTED)
    // ==========================================
    private void createReactBasicsCourse(User instructor) {
        Course course = Course.builder()
                .title("React Basics: Project-Oriented Development")
                .slug("react-basics")
                .description("Build real applications with React: project scaffolding with Vite, component structure, forms, external API integration, loading/error states, and client-side routing.")
                .category("Frontend Engineering")
                .level(CourseLevel.INTERMEDIATE)
                .estimatedDuration("6 weeks")
                .iconUrl("layout")
                .teacher(instructor)
                .status(CourseStatus.PUBLISHED)
                .published(true)
                .publishedAt(LocalDateTime.now())
                .displayOrder(5)
                .build();
        courseRepository.save(course);

        Topic t1 = createTopic(course, "Module 1 — Project Scaffolding & Component Architecture", "react-project-scaffolding", "Scaffolding with Vite, directory layout, atomic design.", 1);
        Lesson l1 = createLesson(t1, "Scaffolding Modern React with Vite", "scaffolding-with-vite", 20, 1);
        addBlock(l1, ContentType.TEXT, "Vite Setup", "Vite provides lightning-fast HMR and ESM bundling. Initialize a project with `npm create vite@latest my-app -- --template react-ts`.", 1);

        Topic t2 = createTopic(course, "Module 2 — Real-World API Integration & Routing", "react-api-routing", "Fetching REST APIs, managing loading and error states, and React Router v6.", 2);
        Lesson l2 = createLesson(t2, "API Integration & Loading States", "react-api-loading-states", 25, 1);
        addBlock(l2, ContentType.TEXT, "Handling Async Data in UI", "Pattern: initialize `{ data: null, loading: true, error: null }` and update state upon promise resolution.", 1);
    }

    // ==========================================
    // 6. REACT NATIVE
    // ==========================================
    private void createReactNativeCourse(User instructor) {
        Course course = Course.builder()
                .title("React Native")
                .slug("react-native-mobile")
                .description("Develop cross-platform native iOS and Android mobile apps using React Native, native primitives, Flexbox styling, navigation, and persistent device storage.")
                .category("Mobile Development")
                .level(CourseLevel.INTERMEDIATE)
                .estimatedDuration("6 weeks")
                .iconUrl("smartphone")
                .teacher(instructor)
                .status(CourseStatus.PUBLISHED)
                .published(true)
                .publishedAt(LocalDateTime.now())
                .displayOrder(6)
                .build();
        courseRepository.save(course);

        Topic t1 = createTopic(course, "Module 1 — Native Primitives & Styling", "react-native-primitives", "View, Text, Image, and mobile Flexbox layout.", 1);
        Lesson l1 = createLesson(t1, "React Native Architecture & Primitives", "rn-architecture-primitives", 20, 1);
        addBlock(l1, ContentType.TEXT, "Mobile Primitives vs Web DOM", "Instead of `<div>` and `<p>`, React Native uses native components `<View>` and `<Text>` that compile to platform-native views (UIView / android.view.ViewGroup).", 1);
        addBlock(l1, ContentType.LINK, "Official React Native Docs", "Official guide for getting started with Expo and React Native CLI.", "{\"url\":\"https://reactnative.dev/docs/getting-started\",\"provider\":\"React Native Docs\"}", 2);

        Topic t2 = createTopic(course, "Module 2 — Lists & Mobile Navigation", "react-native-navigation", "FlatList performance, touchables, and React Navigation.", 2);
        Lesson l2 = createLesson(t2, "Efficient Lists with FlatList", "rn-flatlist-optimization", 25, 1);
        addBlock(l2, ContentType.TEXT, "Virtualization in FlatList", "FlatList renders only items currently visible on screen, maximizing frame rates and minimizing memory usage.", 1);
    }

    // ==========================================
    // 7. MYSQL
    // ==========================================
    private void createMySqlCourse(User instructor) {
        Course course = Course.builder()
                .title("MySQL Relational Databases")
                .slug("mysql-relational-databases")
                .description("Master relational databases: schema design, SQL DDL/DML, multi-table JOINs, indexing, aggregation, normalization, and ACID transactions with official MySQL documentation.")
                .category("Database & Backend")
                .level(CourseLevel.BEGINNER)
                .estimatedDuration("5 weeks")
                .iconUrl("database")
                .teacher(instructor)
                .status(CourseStatus.PUBLISHED)
                .published(true)
                .publishedAt(LocalDateTime.now())
                .displayOrder(7)
                .build();
        courseRepository.save(course);

        Topic t1 = createTopic(course, "Module 1 — Relational Concepts & DDL", "mysql-relational-ddl", "Database design, CREATE TABLE, data types, primary and foreign keys.", 1);
        Lesson l1 = createLesson(t1, "Relational Database Fundamentals & SQL", "mysql-fundamentals-sql", 20, 1);
        addBlock(l1, ContentType.TEXT, "RDBMS & Schema Design", "Relational databases store structured data in tables linked by foreign keys, ensuring integrity through ACID compliance.", 1);
        addBlock(l1, ContentType.VIDEO, "MySQL Full Course for Beginners", "", "{\"videoId\":\"7S_tz1z_5bA\",\"provider\":\"YouTube\",\"attribution\":\"Programming with Mosh\",\"url\":\"https://www.youtube.com/watch?v=7S_tz1z_5bA\"}", 2);
        addBlock(l1, ContentType.LINK, "MySQL Getting Started Guide", "Official MySQL Reference manual for database configuration, queries, and optimization.", "{\"url\":\"https://dev.mysql.com/doc/mysql-getting-started/en/\",\"provider\":\"Oracle MySQL\"}", 3);

        Topic t2 = createTopic(course, "Module 2 — Data Manipulation & Multi-Table Queries", "mysql-dml-joins", "SELECT, WHERE, JOINs (INNER, LEFT, RIGHT), GROUP BY, and aggregates.", 2);
        Lesson l2 = createLesson(t2, "Multi-Table JOINs & Aggregations", "mysql-joins-aggregations", 25, 1);
        addBlock(l2, ContentType.TEXT, "Mastering SQL JOINs", "`INNER JOIN` matches rows in both tables; `LEFT JOIN` includes all rows from the left table regardless of matches.", 1);

        createQuizForTopic(t1, "MySQL DDL & Relational Schema Quiz", "Assess your understanding of tables, keys, and SQL constraints.", 10, 70, List.of(
                new QData("Which SQL constraint uniquely identifies each record in a database table?", List.of(new OData("PRIMARY KEY", true), new OData("FOREIGN KEY", false), new OData("CHECK", false), new OData("DEFAULT", false)), "A PRIMARY KEY uniquely identifies records and cannot contain NULL."),
                new QData("Which clause is used to filter records resulting from a GROUP BY operation?", List.of(new OData("HAVING", true), new OData("WHERE", false), new OData("ORDER BY", false)), "HAVING filters aggregated groups, whereas WHERE filters individual rows.")
        ));
    }

    // --- Helpers ---

    private Topic createTopic(Course course, String title, String slug, String description, int order) {
        Topic topic = Topic.builder()
                .course(course)
                .title(title)
                .slug(slug)
                .description(description)
                .displayOrder(order)
                .build();
        return topicRepository.save(topic);
    }

    private Lesson createLesson(Topic topic, String title, String slug, int minutes, int order) {
        Lesson lesson = Lesson.builder()
                .topic(topic)
                .title(title)
                .slug(slug)
                .contentMarkdown("# " + title + "\n\nWelcome to this lesson.")
                .estimatedMinutes(minutes)
                .displayOrder(order)
                .build();
        return lessonRepository.save(lesson);
    }

    private void addBlock(Lesson lesson, ContentType type, String title, String content, int order) {
        addBlock(lesson, type, title, content, null, order);
    }

    private void addBlock(Lesson lesson, ContentType type, String title, String content, String dataJson, int order) {
        ContentBlock block = ContentBlock.builder()
                .lesson(lesson)
                .type(type)
                .title(title)
                .content(content)
                .dataJson(dataJson)
                .displayOrder(order)
                .build();
        contentBlockRepository.save(block);
    }

    private void createQuizForTopic(Topic topic, String title, String description, int timeLimit, int passingScore, List<QData> questions) {
        Quiz quiz = Quiz.builder()
                .topic(topic)
                .title(title)
                .description(description)
                .timeLimitMinutes(timeLimit)
                .passingScorePercentage(passingScore)
                .build();

        int qOrder = 1;
        for (QData qData : questions) {
            Question q = Question.builder()
                    .quiz(quiz)
                    .questionText(qData.text)
                    .questionType(QuestionType.SINGLE_CHOICE)
                    .points(10)
                    .explanation(qData.explanation)
                    .displayOrder(qOrder++)
                    .build();

            int optOrder = 1;
            for (OData oData : qData.options) {
                QuestionOption opt = QuestionOption.builder()
                        .question(q)
                        .optionText(oData.text)
                        .correct(oData.isCorrect)
                        .displayOrder(optOrder++)
                        .build();
                q.getOptions().add(opt);
            }
            quiz.getQuestions().add(q);
        }
        quizRepository.save(quiz);
    }

    private void createProblem(Course course, Topic topic, String title, String slug, String description,
                               String constraints, Difficulty diff, String language, String starterCode, User author, List<TCData> testCases) {
        if (problemRepository.existsBySlug(slug)) {
            return;
        }
        Problem problem = Problem.builder()
                .course(course)
                .topic(topic)
                .title(title)
                .slug(slug)
                .description(description)
                .constraints(constraints)
                .difficulty(diff)
                .supportedLanguage(language != null ? language : "JAVA")
                .timeLimitMs(2000)
                .memoryLimitMb(256)
                .starterCode(starterCode)
                .createdBy(author)
                .published(true)
                .build();

        int tcOrder = 1;
        for (TCData tc : testCases) {
            TestCase testCase = TestCase.builder()
                    .problem(problem)
                    .inputData(tc.input)
                    .expectedOutput(tc.output)
                    .sample(tc.isSample)
                    .hidden(tc.isHidden)
                    .displayOrder(tcOrder++)
                    .build();
            problem.getTestCases().add(testCase);
        }
        problemRepository.save(problem);
    }

    private record QData(String text, List<OData> options, String explanation) {}
    private record OData(String text, boolean isCorrect) {}
    private record TCData(String input, String output, boolean isSample, boolean isHidden) {}
}
