cmake_minimum_required(VERSION 3.16)
project(backend)
include_directories(${CMAKE_JS_INC})
file(GLOB SOURCE_FILES "lib/*.cpp")
add_library(addon SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})
target_link_libraries(addon ${CMAKE_JS_LIB})
set_target_properties(addon PROPERTIES PREFIX "" SUFFIX ".node"
    RUNTIME_OUTPUT_DIRECTORY_DEBUG "${CMAKE_CURRENT_SOURCE_DIR}/lib"
    RUNTIME_OUTPUT_DIRECTORY_RELEASE "${CMAKE_CURRENT_SOURCE_DIR}/lib"
    RUNTIME_OUTPUT_DIRECTORY_MinSizeRel "${CMAKE_CURRENT_SOURCE_DIR}/lib"
    RUNTIME_OUTPUT_DIRECTORY_RelWithDebInfo "${CMAKE_CURRENT_SOURCE_DIR}/lib"
)