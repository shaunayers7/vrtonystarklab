# Stark Industries VR Lab

A browser-based Three.js/WebXR workshop inspired by Tony Stark's lab. Enter in a
desktop browser or a WebXR-capable headset to explore the armor pods, holographic
workbench, robotic arm, and two illuminated prototype-car bays. The workshop
includes an original powered-armor hologram and full-body suit displays.

## Launch

Serve this folder over HTTPS (or from `localhost`) and open `index.html` in a
WebXR-capable browser such as Meta Quest Browser on Quest 3. Select
**Initialize Laboratory** to unlock the spatial audio and J.A.R.V.I.S. voice
features, then use the VR button to enter the lab. The lab supports seated play;
standing is not required. It uses the headset's floor-relative tracking and the
left thumbstick for movement. The immersive renderer skips desktop bloom and
shadows to keep headset rendering responsive.

## Interactions

- In VR, use the left thumbstick to move and the right thumbstick to snap-turn.
- Tracked hands appear when hand tracking is active; controller models appear
  when using controllers. Hand tracking must be enabled on the headset.
- Squeeze near the active hologram with one controller to move it. Squeeze with
  both hands and move them apart/together to resize; twist them to rotate.
- Load an image before entering VR to project it on the holotable; select
  **Restore Armor** to return to the 3D powered-armor hologram.
- Squeeze near the StarkPad or plasma torch to grab it; use the trigger to switch
  tablet modes or fire the torch.
- Use voice commands such as "explode", "assemble", "red", "blue", "green", or
  "status" to control the holographic armor display.
- Say "wave", "pose", "walk", or "neutral" to articulate the shoulder, elbow,
  hip, and knee joints on the main powered-armor hologram.
