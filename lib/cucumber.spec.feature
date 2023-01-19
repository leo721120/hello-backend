Feature: HTTP example

    Background:

        Given new environment
        Given setup /echo

    Scenario: POST /echo, 200

        Given url /echo
        Given headers
            | name        | value   |
            | x-any-value | test123 |
        Given json
            """
            {
                "abc": 123
            }
            """
        When method POST
        Then expect status should be 200
        Then expect headers should contain
            | name        | value   |
            | x-any-value | test123 |
        Then expect body should be json
            """
            {
                "abc": 123
            }
            """

    @skip
    Scenario: POST /echo, benchmark

        Given url /echo
        Given headers
            | name        | value   |
            | x-any-value | test123 |
        Given json
            """
            {
                "abc": 123
            }
            """
        When benchmark POST
        Then print benchmark
        Then expect timeouts should be less than 2
        Then expect latency.mean should be less than 10ms
        #Then expect errors should be less than 2
        #Then expect non2xx should be less than 2
