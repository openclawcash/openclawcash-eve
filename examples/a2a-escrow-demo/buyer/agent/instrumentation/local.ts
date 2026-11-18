import { disableInstrumentation } from "eve/instrumentation";

// Local dev traces off: on this host another runtime already owns the global OTel tracer slot.
export default disableInstrumentation();
