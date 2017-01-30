/**
 * Created by VinceZK on 1/30/17.
 * An authorization profile contains authorization objects and their authorization fields and values.
 * The values are represented using JS array, whose elements can be elementary values or specific objects.
 * The specific objects are defined as select options which represent ranges of allowed value.
 * For example: [1, 2, {Option:Include; Operator:Between; Low:5; High:10}] means values 1,2,5,6,7,8,9,10 are permitted.
 */
export {profile01 as profile};
var profile01 = [
    {   AuthObject: 'user',
        Group: ['Admin','Ordinary'],
        Action: ['Create','Edit','Display','Delete','Lock','Unlock']
    },
    {
        AuthObject: 'blog',
        Tag: ['DB', 'JS', 'Algorithm'],
        ID: [{Option:'Include', Operator:'Between', Low:1000000, High:1999999}, 2399999],
        Action: '*'
    }
];