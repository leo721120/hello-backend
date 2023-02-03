Feature: GET

    Background: initialize

        Given new environment
        Given new tags
            | id  |
            | T-1 |
            | T-2 |
            | P-3 |

    Scenario: /tags

        Given url /tags
        When method GET
        Then expect status should be 200
        Then expect body should be json
            """
            [
                {
                    "id": "T-1",
                    "parents": [],
                    "resource": null
                },
                {
                    "id": "T-2",
                    "parents": [],
                    "resource": null
                },
                {
                    "id": "P-3",
                    "parents": [],
                    "resource": null
                }
            ]
            """

    Scenario: /tags?field=id

        Given url /tags?field=id
        When method GET
        Then expect status should be 200
        Then expect body should be json
            """
            [
                {
                    "id": "T-1"
                },
                {
                    "id": "T-2"
                },
                {
                    "id": "P-3"
                }
            ]
            """

    @skip
    Scenario: /tags?field=unknown

        Given url /tags?field=unknown
        When method GET
        Then expect status should be 400
        Then expect body should be json
            """
            {
                "type": "none",
                "title": "schema validation failed",
                "instance": "/tags"
            }
            """
