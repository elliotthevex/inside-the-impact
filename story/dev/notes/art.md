# art.js notes (builder: art)

Status: IN PROGRESS. Files owned: story/art.js, story/dev/poses.html.

## Plan / decisions so far
- Figures render facing right into a shared offscreen buffer, then are blitted (flipped for face -1) so alpha, tint, outline, squash and scaleX apply to the whole figure without overlap seams.
- Skeleton in local coords (feet centre = 0,0, y up negative), authored for a 46 px figure and scaled by look.h/46. Knees and elbows by two-bone IK with pole vectors. Limbs stamped as small squares; torso and skirts are pixel-crisp convex polygon fills.
- Heads are fixed-size pixel templates (7x8 skull) per hair style, so kids read as kids (bigger head ratio) and tall adults read tall.
- Near side = the side facing the camera. Facing right that is Jin's RIGHT side (rear hand of an orthodox stance), so the scar on his right cheek shows only when facing right. Jab = far (lead) arm, cross = near (rear) arm.
- blendFrom.k = weight of the PREVIOUS pose (1 = all previous, fades to 0).
