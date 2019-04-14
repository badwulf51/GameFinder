<p align="center">
  <a href="https://imgur.com/nBF0w5gC"><img src="https://imgur.com/nBF0w5g.png" height="10%" width="10%" title="header image"/></a>
</p>

# GameFinder
GameFinder is an Alexa Skill which allows user using voice controls to search for details about video games, locations in games and characters in games.
GameFinder was developed as part of Gesture Based UI at GMIT.

## Table of contents
- [GameFinder](#gamefinder)
  * [Table of contents](#table-of-contents)
  * [Getting Started](#getting-started)
    + [Prerequisites](#prerequisites)
    + [Installing](#installing)
  * [Tests](#tests)
    + [Intent Examples](#intent-examples)
      - [Game](#game)
      - [Location](#location)
      - [Character](#character)
    + [Testing Intents](#testing-intents)
      - [Phrase not built into intent](#phrase-not-built-into-intent)
      - [Not giving a game, location or character](#not-giving-a-game--location-or-character)
      - [Giving non exsisting game, location or character](#giving-non-exsisting-game--location-or-character)
  * [Alexa Skill Store Report](#alexa-skill-store-report)
    + [Submission (Passed)](#submission--passed-)
      - [Automatic Review](#automatic-review)
      - [Manual Review](#manual-review)
      - [Certification Analysis](#certification-analysis)
  * [Project Documentation](#project-documentation)
    + [Videos](#videos)
      - [Presentation](#presentation)
      - [Demo](#demo)
    + [Project Write Up](#project-write-up)
  * [Conclusion](#conclusion)
  * [Built With](#built-with)
  * [Authors](#authors)
  * [Store Page Details](#store-page-details)
  * [License](#license)

## Getting Started

- Setup blank folder
- Right click on project folder
- Git clone https://github.com/cian2009/GestureBasedProject.git

### Prerequisites

Amazon Echo & Alexa:
[Amazon Echo Range](https://www.amazon.co.uk/dp/B0792KWK57/ref=fs_dn)

Alexa Developer Account:
[Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)

AWS Account to access AWS Lambda:
[AWS Lambda](https://aws.amazon.com/lambda/)

Download Node.js
[Node.js](https://nodejs.org/en/)

### Installing

A step by step series of examples that tell you have to get a development env running

1. Set-up Alexa Skill in the Alexa Development Console

2. Set-up AWS Lambda function

3. Set-up Git Repository

```
Git clone https://github.com/cian2009/GestureBasedProject
```

4. npm install

5. Initialise project using ASK CLI
```
ask init
```

## Tests

<img src="https://imgur.com/SyTQj1Y.png"/>

Tests were conducted on Echo Dot, Echo, Echo Show and Echo Spot.

Testing for visual purposes were done on the Alexa Devloper Console, which provides an Alexa in the browser to test the skill.

### Intent Examples

#### Game
A basic query to the skill asking for data about Fallout 3

> Alexa ask game finder what is Fallout 3

Audio:                |  UI:
:-------------------------:|:-------------------------:
![](https://imgur.com/jnvMdus.png)  |  ![](https://imgur.com/HVfg2Lo.png)

#### Location
A basic query to the skill asking for data about Megaton

> Alexa ask game finder what is Megaton

Audio:                |  UI:
:-------------------------:|:-------------------------:
![](https://imgur.com/1bs61A4.png)  |  ![](https://imgur.com/84hGbu4.png)

#### Character
A basic query to the skill asking for data about Master Chief

> Alexa ask game finder who is Master Chief

Audio:                |  UI:
:-------------------------:|:-------------------------:
![](https://imgur.com/BUINYCy.png)  |  ![](https://imgur.com/pqciSk6.png)

### Testing Intents

#### Phrase not built into intent

Due to how alexa works to find which intent works best with what the user is trying to call, we can also used phrases not built into how intents are called.
Alexa is very good at adapting to the user using a phrase outside what the intents have been built to use.

> Alexa ask game finder about fallout 3

Audio:                |  UI:
:-------------------------:|:-------------------------:
![](https://imgur.com/9UvoktQ.png)  |  ![](https://imgur.com/lcAoGlD.png)

'about fallout 3' is not an intent, but Alexa can figure out of the available intents which would work best for what the user has said.

#### Not giving a game, location or character

> Alexa ask game finder what is

Audio:                |  UI:
:-------------------------:|:-------------------------:
![](https://imgur.com/6RKPDQv.png)  |  ![](https://imgur.com/NmrGlXS.png)

#### Giving non exsisting game, location or character

> Alexa ask game finder what is 1234567890

Audio:                |  UI:
:-------------------------:|:-------------------------:
![](https://imgur.com/fGwYeMP.png)  |  ![](https://imgur.com/RfIZ4FH.png)

## Alexa Skill Store Report

### Submission (Passed)

#### Automatic Review
Validation:                |  Functional test:
:-------------------------:|:-------------------------:
![](https://imgur.com/lU1Tvs3.png)  |  ![](https://imgur.com/KfVUAX8.png)

The automatic review just checked if the basic intents were programmed into the Skill and checked if the custom intents exsisted.
This review passed as it found no bugs and found custom intents and all five 'Built-In Intents' were programmed into the skill.

#### Manual Review
<img src="https://imgur.com/cEqiHM0.png"/>

The manual review is done by an employee at Amazon. The skill passed the manual review as the custom intents had enough content to get into the skill store.
And all five 'Built-In Intents' were present and working.

#### Certification Analysis
The Certification process was very quick and gave feedback along the way in order to make the process as painless as possible for developers.

## Project Documentation

* [Project Specification](https://github.com/cian2009/GestureBasedProject/blob/master/Project-Spec.pdf) - Project specification

The project specification outlined what a proper gesture based UI project should contain. Using what the spec outlined we were able to get an Alexa application that had useful functionality to the market (Link at bottom of page).

The project specification asked for an implementation of a gesture based system (this GitHub repo), documentation of the implementation (below in this section) and short videos of the project in use (below in this section).

### Videos
Two videos are present. First video is a presentation of the project and the second is a short demo of the project running.

#### Presentation
[![Presentation](https://imgur.com/9oJxbiZ.png)](https://www.youtube.com/watch?v=kANHj3TlU7M)

#### Demo
[![Demo](https://imgur.com/teWgtUz.png)](https://www.youtube.com/watch?v=G4bOt0RVIpo)

### Project Write Up
* [Project Research](https://github.com/cian2009/GestureBasedProject/blob/master/Research/GestureBasedProject.pdf) - Documentation asked for by the project specification

The research paper outlines out thought process on how we setup the Alexa skill and why we picked Alexa over other gesture based systems.

## Conclusion
Setting up an Alexa skill was the most difficult part as it was something completly new to us. Althought the setup was difficult, once the project was setup, and we had a basic intent working, it was very interesting to see how Voice gestures are developed. The Alexa developement process was very interesting to learn, as gesture based UI becomes a greater part of our lives. It also gave us a large market as the application was was on [Amazon/Alexa skill store](#store-page-details), giving us a userbase to get feedback on our skill and see it live in action on the market for anyone to download.

## Built With

* [Visual Studio Code](https://code.visualstudio.com/) - IDE used
* [Node.js](https://nodejs.org/en/) - Allows execution of JavaScript outside the browser
* [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) - Used to create and distribute the skill
* [AWS Lambda](https://aws.amazon.com/lambda/) - AWS Lamdba is used to host the source code used by the skill
* [Ask CLI](https://www.npmjs.com/package/ask-cli) - Tool to manage Alexa skills and related resources
* [GiantBomb API](https://www.giantbomb.com/api/) - API used to access game, location and character information
* [Overleaf](https://www.overleaf.com) - Overleaf is an online LaTeX editor used for project research paper
* [StackOverflow](https://stackoverflow.com/) - Community forum for troubleshooting

## Authors

* **Cian Gannon** - *Source code, UI and Research* - [Github](https://github.com/cian2009)
* **Aron O Malley** - *Source code, UI and Research* - [Github](https://github.com/badwulf51)

## Store Page Details

<img src="https://imgur.com/WYE5bi8.png"/>

* **[GameFinder](https://www.amazon.co.uk/Cian-GameFinder/dp/B07QH4N2GG)** - Store page for skill

Getting the skill onto the Amazon/Alexa skill store was quite an easy process once all the basic checks are complete. The process was very similar to the UWP process that Microsoft has for their store. 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details
