Feature: Add Brand

    Background: initialize

        Given new environment
        Given apply licenses
            | mode    | points | tenant |
            | builder | 0      | A      |
            | manager | 200    | A      |

    Scenario: register an Advantech device

        When register devices
            | did   | manufacturer |
            | AA:01 | advantech    |
        Then expect result to be 'success'
        Then expect tenant remain points to be '200'
        Then expect tenant daily consumed points to be '200'
