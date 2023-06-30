Feature: GET /version

    Background:

        Given new environment
            | service |

    Scenario: 200

        Given url /version
        When method GET
        Then expect status should be 200
        Then expect headers should contain
            | name         | value            |
            | content-type | application/json |
        Then expect body schema should be
            | openapi          |
            | paths            |
            | /version         |
            | get              |
            | responses        |
            | 200              |
            | content          |
            | application/json |
            | schema           |
