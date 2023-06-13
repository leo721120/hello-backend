cmake_minimum_required(VERSION 3.16)
project(lib CXX)
message(STATUS "CMAKE_JS_SRC=${CMAKE_JS_SRC}")
message(STATUS "CMAKE_JS_LIB=${CMAKE_JS_LIB}")
message(STATUS "CMAKE_JS_INC=${CMAKE_JS_INC}")
#
file(GLOB SOURCE_FILES
    "*.cpp"
)
add_library(addon SHARED
    ${SOURCE_FILES}
    ${CMAKE_JS_SRC}
)
target_link_libraries(addon
    ${CMAKE_JS_LIB}
    ${Boost_LIBRARIES}
)
target_include_directories(addon
    PRIVATE
    ${CMAKE_JS_INC}
	PUBLIC
    ${Boost_INCLUDE_DIR}
)
target_compile_definitions(addon
    PRIVATE
)
set_target_properties(addon PROPERTIES
    PREFIX "" SUFFIX ".node"
    RUNTIME_OUTPUT_DIRECTORY_DEBUG "${CMAKE_CURRENT_SOURCE_DIR}"
    RUNTIME_OUTPUT_DIRECTORY_RELEASE "${CMAKE_CURRENT_SOURCE_DIR}"
    RUNTIME_OUTPUT_DIRECTORY_MinSizeRel "${CMAKE_CURRENT_SOURCE_DIR}"
    RUNTIME_OUTPUT_DIRECTORY_RelWithDebInfo "${CMAKE_CURRENT_SOURCE_DIR}"
)
if(Boost_FOUND)
    target_compile_definitions(addon
        PRIVATE
        Boost_FOUND
    )
endif()