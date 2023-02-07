Feature: HTTP

    Background:

        Given new environment

    Scenario: GET

        Given url /version
        When method GET
        Then expect status should be 200
