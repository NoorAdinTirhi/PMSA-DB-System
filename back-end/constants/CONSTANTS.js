//TODO make sure to remove the temporary values
module.exports = {
    ROLES: {
        ADMIN: ['SecgenNat'],
        LOCALADMIN: ['Secgen']
    },

    mainPage_varialbes: {
        position: "temp",
        userLC: "temp",
        cipher:" ",
        user : "",
        // natSecgenLTG: "temp",
        // natSecgenLC: "temp",
        // NablusSecgenLTG: "temp",
        // NablusSecgenLC: "temp",
        // JerusalemSecgenLTG: "temp",
        // JerusalemSecgenLC: "temp",
        // HUSecgenLTG: "temp",
        // HUSecgenLC: "temp",
        // PPUSecgenLTG: "temp",
        // PPUSecgenLC: "temp",
        // JininSecgenLTG: "temp",
        // JininSecgenLC: "temp",
        // GazaSecgenLTG: "temp",
        // GazaSecgenLC: "temp",
        usersLog : [{
            position:"",
            lastLogDate:"",
            lastChange:""
        }],
        NablusStartDate: "temp",
        HUStartDate: "temp",
        GazaStartDate: "temp",
        JerusalemStartDate:"temp",
        PPUStartDate: "temp",
        JeninStartDate: "temp"
    },
    allMembers_variables :{
        position            :"temp",
        userLC              :"temp",
        cipher              : "",
        user                : "",
        engFname            : "",
        engFather           : "",
        engGfather          : "",
        engLname            : "",
        arabFname           : "",
        arabFather          : "",
        arabGfather         : "",
        arabLname           : "",
        areaCode            : "",
        phoneNo             : "",
        email               : "",
        facebook            : "",
        firstYear           : "",
        uniNum              : "",
        localCommittee      : "",
        memStatus           : "",
        trainerStatus       : "",
        blacklistStatus     : "",
        blacklistReason     : "",
        nationalActivities  : [],
        localActivities     : [],
        curMemNumber        : "",
    },

    activityPage_variables: {
        //USER
        user: "noor",
        //all Activities attributes
        allActivities: [{
            actID: 1,
            actName: "one"
        }, {
            actID: 2,
            actName: "two"
        }],
        allActNum: 0,
        //general Activities attributes
        generalActivities: [],
        genActNum: 0,
        //CB Activities attributes
        CBActivities: [],
        CBActNum: 0,
        //SCORF Activities attributes
        scorfActivities: [],
        scorfActNum: 0,
        //SCOPE Activities attributes
        scopeActivities: [{
            actID: 3,
            actName: "three"
        }],
        scopeActNum: 0,
        //SCOME Activities attributes
        scomeActivities: [],
        scomeActNum: 0,
        //SCORP Activities attributes
        scorpActivities: [],
        scorpActNum: 0,
        //SCORA Activities attributes
        scoraActivities: [],
        scoraActNum: 0,
        //SCOPH
        scophActivities: [],
        scophActNum: 0
    },

    users: [
        { username: 'noor', id: 1, }
    ],
    files: [

    ],


}