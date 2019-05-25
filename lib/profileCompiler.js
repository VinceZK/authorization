/**
 * Created by VinceZK on 2/3/17.
 * Compile multiple raw profiles into a merged one so that authority-check is more efficient.
 * For example, 2 raw profiles are provided:
 * profile1:
 * [    {   "AuthObject": "user",
            "AuthFieldValue":{
                "Group": ["Ordinary"],
                "Action": ["Create","Edit","Display","Delete","Lock","Unlock"]
            }
        },
 {    "AuthObject": "blog",
            "AuthFieldValue":{
                "Tag": ["DB", "JS", "Algorithm"],
                "ID": [{"Operator":"Between", "Option":"Include", "Low":0, "High":1999999}, 2399999],
                "Action": ["Post", "Edit", "Publish"]
            }
        }
 ]
 * profile2:
 * [    {   "AuthObject": "user",
            "AuthFieldValue":{
                "Group": ["Admin"],
                "Action": ["Edit","Display","Lock","Unlock"]
            }
        },
 {
            "AuthObject": "blog",
            "AuthFieldValue":{
                "ID": [{"Operator":"Between", "Option":"Include", "Low":4000000, "High":4999999}, 7899999],
                "Action": "*"
            }
         }
 ]
 * The returned compiled profile would be:
 * [    {   "AuthObject": "user",
            "AuthFieldValueComposition":[
                {   "Group": ["Ordinary"],
                    "Action": ["Create","Edit","Display","Delete","Lock","Unlock"]
                },
                {   "Group": ["Admin"],
                    "Action": ["Edit","Display","Lock","Unlock"]
                }
            ]
        },
        {   "AuthObject": "blog",
            "AuthFieldValueComposition":[
                {   "Tag": ["DB", "JS", "Algorithm"],
                    "ID": [{"Operator":"Between", "Option":"Include", "Low":0, "High":1999999}, 2399999],
                    "Action": ["Post", "Edit", "Publish"]
                },
                {
                    "ID": [{"Operator":"Between", "Option":"Include", "Low":4000000, "High":4999999}, 7899999],
                    "Action": "*"
                }
            ]
        }
   ]
 */

/**
 * Compile multiple raw profiles into a merged one so that authority-check is more efficient.
 * @param rawProfiles
 * @returns {Array}
 */
function compileProfile(rawProfiles){
    const singleRawProfile = _flatten(rawProfiles);
    const compiledProfile = [];

    singleRawProfile.forEach( authorization => {
        const existAuthorization = compiledProfile.find( compliedAuthorization =>
            compliedAuthorization['AuthObject'] === authorization['AuthObject'] );
        if (existAuthorization) {
            existAuthorization.AuthFieldValueComposition.push(authorization['AuthFieldValue']);
        } else {
            compiledProfile.push({
                AuthObject: authorization['AuthObject'],
                AuthFieldValueComposition: [authorization['AuthFieldValue']]
            })
        }
    });

    return compiledProfile;
}

/**
 * Flatten multiple raw profiles into an single raw profile.
 * @param rawProfiles
 * @returns {Array}
 * @private
 */
function _flatten(rawProfiles) {
    const flattenedRawProfile = [];
    rawProfiles.forEach( rawProfile =>
        rawProfile.forEach( authorization => flattenedRawProfile.push(authorization)));
    return flattenedRawProfile;
}

module.exports.compileProfile = compileProfile;