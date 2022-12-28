#include <nan.h>

void Init(v8::Local<v8::Object> exports) {
  v8::Local<v8::Context> context = exports->CreationContext();
  exports->Set(context, Nan::New("hello").ToLocalChecked(), Nan::New<v8::FunctionTemplate>([](const Nan::FunctionCallbackInfo<v8::Value>& info) {
#if defined(_DEBUG)
    info.GetReturnValue().Set(Nan::New("world (DEBUG)").ToLocalChecked());
#else
    info.GetReturnValue().Set(Nan::New("world").ToLocalChecked());
#endif
  })->GetFunction(context).ToLocalChecked());
}

NODE_MODULE(hello, Init)