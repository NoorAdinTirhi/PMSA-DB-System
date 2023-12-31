//TODO make sure to remove the temporary values
module.exports = {
    ROLES: {
        ADMIN: ['SecgenNat'],
        LOCALADMIN: ['Secgen']
    },

    mainPage_varialbes: {
        position: "temp",
        userLC: "temp",
        cipher: " ",
        user: "",
        usersLog: [{
            position: "",
            lastLogDate: "",
            lastChange: ""
        }],
        nablusStartDate: "temp",
        huStartDate: "temp",
        gazaStartDate: "temp",
        jerusalemStartDate: "temp",
        ppuStartDate: "temp",
        jeninStartDate: "temp",
        chosenLC:""
    },
    allMembers_variables: {
        position: "temp",
        userLC: "temp",
        cipher: "",
        user: "",
        engFname: "",
        engFather: "",
        engGfather: "",
        engLname: "",
        arabFname: "",
        arabFather: "",
        arabGfather: "",
        arabLname: "",
        areaCode: "",
        phoneNo: "",
        email: "",
        facebook: "",
        firstYear: "",
        uniNum: "",
        gender: "",
        localCommittee: "",
        memStatus: "",
        trainerStatus: "",
        blacklistStatus: "",
        blacklistReason: "",
        nationalActivities: [],
        localActivities: [],
        curMemNumber: "",
        chosenLC: "",
    },
    allTrainers_variables: {
        position: "temp",
        userLC: "temp",
        cipher: "",
        user: "",
        engFname: "",
        engFather: "",
        engGfather: "",
        engLname: "",
        arabFname: "",
        arabFather: "",
        arabGfather: "",
        arabLname: "",
        areaCode: "",
        phoneNo: "",
        email: "",
        facebook: "",
        firstYear: "",
        uniNum: "",
        gender: "",
        localCommittee: "",
        memStatus: "",
        trainerStatus: "",
        blacklistStatus: "",
        blacklistReason: "",
        nationalActivities: [],
        localActivities: [],
        curMemNumber: "",
        trainerCategory: "",
        gradActivity: "",
        gradDate: "",
        trainerStatus: ""
    },

    activityPage_variables: {
        position: "temp",
        userLC: "temp",
        cipher: "",
        user: "",
        filter: "",
        allActivities: []
    },

    blackList_variables: {
        position: "temp",
        userLC: "temp",
        cipher: "",
        user: "",
        blackLisitngs : []
    },

    nationalActivity_variables: {
        position: "temp",
        userLC: "temp",
        cipher: "",
        user: "",
        activityName : "",
        activityDescription : "",
        proposalLink : "",
        reportLink : "",
        startDate : "",
        endDate : "",
        activityID : "",
        committeeName : "",
        nablusPercent : 0,
        gazaPercent : 0,
        ppuPercent : 0,
        jerusalemPercent : 0,
        jeninPercent : 0,
        huPercent : 0,
        particiapntNumber : "",
        participantName : "",
        participantLocalCommittee : "",
        participantYearOfStudy : "",
        participantPhoneNO : "",
        participantEmail : "",
        participantFacebook : "",
        nationalActivites : [],
        localActivites : [],
        involvedLC : []

    },

    localActivity_variables: {
        position: "temp",
        userLC: "temp",
        cipher: "",
        user: "",
        activityName : "",
        activityDescription : "",
        proposalLink : "",
        reportLink : "",
        startDate : "",
        endDate : "",
        activityID : "",
        committeeName : "",
        participantName : "",
        participantLocalCommittee : "",
        participantYearOfStudy : "",
        participantPhoneNO : "",
        participantEmail : "",
        participantFacebook : "",
        
        nationalActivites : [],
        localActivites : []

    },
    
    certificate_variables: {
        participantName : "",
        activityName : "",
        actStartDate : "",
        actEndDate : "",
        participentPosition : "",
        certCode : ""
    }

}