#pragma warning(push)
//#pragma warning(disable:4819)
#include <napi.h>
#pragma warning(pop)

namespace Module {

  Napi::Value Hello(const Napi::CallbackInfo &info)
  {
    const auto env = info.Env();

    const auto name = info[0].ToString().Utf8Value();

    const auto reply = "hello " + name;

    return Napi::String::New(env, reply);
  }
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "hello"), Napi::Function::New(env, Module::Hello));

  return exports;
}

NODE_API_MODULE(addon, Init)