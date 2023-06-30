Feature: GET /time

    Background:

        Given datetime is 2021-05-31T10:26:02.922Z
        Given new environment
            | service |

    Scenario: 200

        Given url /time
        When method GET
        Then expect status should be 200
        Then expect headers should contain
            | name         | value            |
            | content-type | application/json |
        Then expect body schema should be
            | openapi          |
            | paths            |
            | /time            |
            | get              |
            | responses        |
            | 200              |
            | content          |
            | application/json |
            | schema           |
        Then expect body should be json
            """
            {
                "now": "2021-05-31T10:26:02.922Z",
                "name": "Asia/Taipei",
                "offset": -480
            }
            """
