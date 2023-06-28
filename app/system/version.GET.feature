Feature: GET /versions

    Background:

        Given new environment
            | service |

    Scenario: 200

        Given url /versions
        When method GET
        Then expect status should be 200
        Then expect headers should contain
            | name         | value            |
            | content-type | application/json |
        Then expect body schema should be
            | openapi          |
            | paths            |
            | /versions        |
            | get              |
            | responses        |
            | 200              |
            | content          |
            | application/json |
            | schema           |
