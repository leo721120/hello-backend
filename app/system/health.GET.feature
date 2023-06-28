Feature: GET

    Background:

        Given new environment

    Scenario: /health, 204

        Given url /health
        When method GET
        Then expect status should be 204
