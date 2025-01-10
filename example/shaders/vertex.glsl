out vec2 vUv;

void main() {
    float scale = 0.5;
    vUv = scale * uv;
    gl_Position = vec4(scale * position, 1.0);
}
