var Cipher = {};

/**
 * Rotate a unicode string using a key
 *
 * @param {string} text
 * @param {string} key
 * @param {boolean} reverse
 *
 * @return {string}
 */

Cipher.keyRotate = function(text, key, reverse) {
    // Surrogate pair limit
    var bound = 0x10000;

    // Create string from character codes
    return String.fromCharCode.apply(null,
        // Turn string to character codes
        text.split('').map(function(v, i) {
            // Get rotation from key
            var rotation = key[i % key.length].charCodeAt();

            // Are we decrypting?
            if(reverse) rotation = -rotation;

            // Return current character code + rotation
            return (v.charCodeAt() + rotation + bound) % bound;
        })
    );
};

module.exports = Cipher;