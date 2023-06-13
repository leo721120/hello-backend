#ifndef DEBUG
#pragma message("[i] release build")
#else
#pragma message("[i] debug build")
#endif
#ifndef Boost_FOUND
#pragma message("[i] boost not supported")
#else
#include <boost/filesystem.hpp>
#endif
#pragma warning(push)
//#pragma warning(disable:4819)
#include <napi.h>
#pragma warning(pop)
#include <iostream>
//
namespace Module {
  Napi::Value Hello(const Napi::CallbackInfo &info)
  {
    const auto env = info.Env();

    const auto name = info[0].ToString().Utf8Value();

    const auto reply = "hello " + name;

    return Napi::String::New(env, reply);
  }
  Napi::Value Cwd(const Napi::CallbackInfo &info)
  {
    const auto env = info.Env();
#ifdef BOOST_FILESYSTEM_VERSION
    const auto home = boost::filesystem::current_path().string();

    return Napi::String::New(env, home);
#else
    return Napi::String::New(env, "unknown");
#endif
  }
}
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "hello"), Napi::Function::New(env, Module::Hello));

  exports.Set(Napi::String::New(env, "cwd"), Napi::Function::New(env, Module::Cwd));

  return exports;
}
NODE_API_MODULE(addon, Init)