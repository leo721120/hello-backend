Feature: GET

    Background:

        Given new environment

    Scenario: /configs/:name, 404

        Given url /configs/not-exist
        When method GET
        Then expect status should be 404
        Then expect headers should contain
            | name         | value                    |
            | content-type | application/problem+json |
