const glsl = (t, defines) => t.raw[0] + defines + t.raw[1];

export default defines => glsl`#version 300 es

${defines}

#ifndef NUMBER_OF_LIGHTS
#define NUMBER_OF_LIGHTS 0
#endif

precision mediump float;

uniform LIGHT {
    vec4 position[NUMBER_OF_LIGHTS];
    vec4 diffuse[NUMBER_OF_LIGHTS];
    vec4 specular[NUMBER_OF_LIGHTS];
    vec4 ambient;
} light;

// material:
uniform vec4 materialColor;
uniform vec4 materialAmbient;
uniform vec4 materialSpecular;
uniform float shininess;

#ifdef HAS_MAP
uniform sampler2D map;
#endif

#ifdef HAS_SPECULAR_MAP
uniform sampler2D specularMap;
#endif

in vec3 position; // position multiplied by modelViewMatrix.
in vec3 normal;
in vec2 texcoord_0;

out vec4 fColor;

void main() {
    vec3 normal = normalize(normal); // Interpolated normal may not be normalized anymore.

    vec3 totalLighting = vec3(light.ambient) * vec3(materialAmbient);

    for (int i = 0; i < NUMBER_OF_LIGHTS; i++) {

        vec4 diffuseColor = materialColor * light.diffuse[i];

        #ifdef HAS_MAP
        diffuseColor *= texture(map, texcoord_0);
        #endif

        vec3 specularColor = (light.specular[i] * materialSpecular).xyz;

        vec3 lightDirection;
        if (light.position[i].w == 0.0) { // directional light

            lightDirection = normalize(light.position[i].xyz);

        } else { // point light
        
            lightDirection = normalize(light.position[i].xyz - position);

        }

        vec3 reflectDirection = reflect(-lightDirection, normal);

        // The camera position is at origo since we're in eye space (i.e. we've multiplied by modelViewMatrix).
        // The negative position will give us the direction from the point on the model towards the camera.
        vec3 viewDirection = normalize(-position);

        // Given lightDirection and normal you should be able to calulate diffuse.
        float lambertian = clamp(dot(lightDirection, normal), 0.001, 1.0);

        float specular = 0.0;
        if (lambertian > 0.0) {
            // Using reflectDirection and viewDirection we can calculate the specular angle.
            float specAngle = max(dot(reflectDirection, viewDirection), 0.0);
            specular = pow(specAngle, shininess);
        }

        #ifdef HAS_SPECULAR_MAP
        specular *= texture(specularMap, texcoord_0).r;
        #endif

        totalLighting = totalLighting + (lambertian * diffuseColor).xyz + (specular * specularColor);

    }

    fColor = vec4(totalLighting, 1.0);
}`;