Feature: GET

    Background:

        Given new environment
        Given dapr

    Scenario: /dapr/metadata, 200

        Given url /dapr/metadata
        When method GET
        Then expect status should be 200
