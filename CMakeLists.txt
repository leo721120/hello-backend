cmake_minimum_required(VERSION 3.16)
project(backend)
set(CMAKE_JS_INC "${CMAKE_JS_INC};${CMAKE_CURRENT_SOURCE_DIR}/node_modules/node-addon-api")
set(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} -W3 -DDEBUG")
set(CMAKE_SHARED_LINKER_FLAGS_RELEASE "${CMAKE_SHARED_LINKER_FLAGS_RELEASE} /DEBUG /OPT:REF /OPT:ICF")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /Zi")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -W3 -DDEBUG")
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_STANDARD 14)
#
if(NOT Boost_FOUND)
    set(Boost_USE_STATIC_RUNTIME ON)
    set(Boost_USE_STATIC_LIBS ON)
    #set(Boost_DEBUG ON)
    #
    if(MSVC)
        set(BOOST_ROOT "$ENV{VCPKG_ROOT}/installed/x64-windows-static")
        set(Boost_LIBRARY_DIR_DEBUG "${BOOST_ROOT}/debug/lib")
        set(Boost_LIBRARY_DIR_RELEASE "${BOOST_ROOT}/lib")
    endif()
    #
    find_package(Boost 1.80.0)
    #
    if(NOT Boost_LIBRARIES)
        file(GLOB Boost_LIBRARIES_RELEASE
            "${Boost_LIBRARY_DIR_RELEASE}/boost*.lib"
        )
        file(GLOB Boost_LIBRARIES_DEBUG
            "${Boost_LIBRARY_DIR_DEBUG}/boost*.lib"
        )
        foreach(LIB ${Boost_LIBRARIES_RELEASE})
            set(Boost_LIBRARIES
                ${Boost_LIBRARIES}
                optimized
                ${LIB}
            )
        endforeach()
        #
        foreach(LIB ${Boost_LIBRARIES_DEBUG})
            set(Boost_LIBRARIES
                ${Boost_LIBRARIES}
                debug
                ${LIB}
            )
        endforeach()
    endif()
endif()
#
add_definitions(-DUNICODE -D_UNICODE)
add_definitions(-DNAPI_VERSION=3)
add_subdirectory("lib")
# way to import external project
#add_subdirectory("../outside" proj-name)