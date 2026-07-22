# Class 1 -- Development Environment Setup

## Summary

In this class, we discussed all the tools required for the Java
development course and how to set them up.

### Tools Required

1.  Install the **Java Development Kit (JDK)** to write, compile, and
    run Java programs.
2.  Install **IntelliJ IDEA** as the Integrated Development Environment
    (IDE) for writing, running, debugging, and testing Java
    applications.
3.  Create or sign in to a **GitHub** account, where the course code,
    assignments, and learning resources will be shared.
4.  Install and configure the **OpenAI Codex CLI** so you can get AI
    assistance while writing, understanding, debugging, and refactoring
    code.
5.  Install **Wispr Flow** (or your preferred voice dictation tool) to
    enable voice commands and speech-to-text input while interacting
    with the Codex terminal.

------------------------------------------------------------------------

# Step 1: Install Java Development Kit (JDK)

## Purpose

The Java Development Kit (JDK) provides the tools required to develop
Java applications.

It includes: - Java Compiler (`javac`) - Java Runtime (`java`) -
Development libraries - Debugging tools

Without the JDK, you cannot compile or run Java programs.

### Installation Steps

1.  Download **JDK 21 (LTS)** from Oracle or Eclipse Temurin.
2.  Run the installer.
3.  Complete the installation using the default settings.

### Verify Installation

``` bash
java -version
javac -version
```

If both commands display version numbers, the JDK has been installed
successfully.

------------------------------------------------------------------------

# Step 2: Install IntelliJ IDEA

## Purpose

IntelliJ IDEA is the IDE used throughout this course.

Features: - Code editor - Auto-completion - Debugger - Build tools - Git
integration - Integrated terminal - Project management

### Installation Steps

1.  Download **IntelliJ IDEA Community Edition**.
2.  Run the installer.
3.  Accept the default installation options.
4.  Launch IntelliJ.

### Configure JDK

1.  Click **New Project**.
2.  Select **Java**.
3.  Choose **JDK 21**.
4.  Enter a project name.
5.  Click **Create**.

------------------------------------------------------------------------

# Step 3: Create a GitHub Account

## Purpose

GitHub is used for: - Course source code - Assignments - Notes - Version
control - Collaboration

### Steps

1.  Create a GitHub account.
2.  Install Git.
3.  Verify:

``` bash
git --version
```

4.  Configure Git:

``` bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

5.  Clone the course repository when it is shared.

``` bash
git clone <repository-url>
```

------------------------------------------------------------------------

# Step 4: Install and Configure OpenAI Codex CLI

## Purpose

Codex helps with: - Explaining code - Generating code - Fixing bugs -
Refactoring - Writing unit tests - Understanding projects

### Prerequisites

Install Node.js (LTS) and Git.

Verify:

``` bash
node -v
npm -v
```

### Install

``` bash
npm install -g @openai/codex
```

Verify:

``` bash
codex --version
```

### Authenticate

``` bash
codex
```

Sign in using your ChatGPT account or configure an API key if required.

### Use with IntelliJ

1.  Open your Java project.
2.  Open the IntelliJ Terminal.
3.  Navigate to the project folder.
4.  Run:

``` bash
codex
```

------------------------------------------------------------------------

# Step 5: Install Wispr Flow

## Purpose

Wispr Flow enables voice-to-text input so you can interact with Codex
and other applications using your voice.

### Installation Steps

1.  Download Wispr Flow from the official website.
2.  Install it.
3.  Sign in.
4.  Grant microphone permission.
5.  Select your microphone.

### Usage

1.  Open IntelliJ.
2.  Open the Terminal.
3.  Launch Codex.
4.  Start Wispr Flow.
5.  Speak naturally to dictate commands and prompts.

------------------------------------------------------------------------

# Recommended Installation Order

1.  Java JDK 21
2.  IntelliJ IDEA Community Edition
3.  Git
4.  GitHub Account
5.  Node.js (LTS)
6.  OpenAI Codex CLI
7.  Wispr Flow

After completing these steps, your system will be ready for Java
development, AI-assisted coding with Codex, version control using
GitHub, and voice-enabled productivity using Wispr Flow.
