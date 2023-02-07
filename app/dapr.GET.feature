Feature: GET

    Background:

        Given new environment
        Given dapr

    Scenario: /dapr/metadata, 200

        Given url /dapr/metadata
        When method GET
        Then expect status should be 200

    Scenario: /dapr/metadata, on('event')

        Given url /dapr/metadata
        When method GET
        Then expect status should be 200
        Then expect events should be
            | type | source         |
            | GET  | /dapr/metadata |
            | GET  | /v1.0/metadata |
            | GET  | /v1.0/metadata |
            | GET  | /dapr/metadata |

