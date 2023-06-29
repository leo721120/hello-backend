Feature: GET

    Background:

        Given new environment

    Rule: /configs/:name

        Scenario: 401

            Given url /configs/something
            When method GET
            Then expect status should be 401
            Then expect headers should contain
                | name         | value                    |
                | content-type | application/problem+json |

        Scenario: 404

            Given url /configs/not-exist
            Given authorization
                | username | password |
                | tester   | 1234     |
            When method GET
            Then expect status should be 404
            Then expect headers should contain
                | name         | value                    |
                | content-type | application/problem+json |
