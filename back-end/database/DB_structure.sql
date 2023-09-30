-- DO NOT RUN THIS EVER AFTER FIRST CREATION AND INSERTING DATA, ALL DATA WILL THEN BE REMOVED

DROP DATABASE PMSA_DB;

CREATE DATABASE PMSA_DB;

USE PMSA_DB; 


CREATE TABLE Users(
	Username VARCHAR(50) PRIMARY KEY,
    Hmac VARCHAR(64) NOT NULL,
    Hkey BIGINT NOT NULL,
    Position ENUM('SECGEN', 'CBDirector') NOT NULL,
    Locality ENUM('National','Nablus', 'Jerusalem', 'Gaza', 'HU', 'PPU', 'Jinin') NOT NULL
);

CREATE TABLE LocalCommittees
(
	city ENUM('Nablus', 'Jerusalem', 'Gaza', 'HU', 'PPU', 'Jinin') PRIMARY KEY,
    membershipStatus ENUM('Full','Canditate') NOT NULL
    -- will want to know number of members
    -- will want to know number of activities
    -- will want to know number of trainers
);


CREATE TABLE members(
	UniID INT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    FatherName VARCHAR(50) NOT NULL,
    GFatherName VARCHAR(50) NOT NULL,
    FamilyName VARCHAR(50) NOT NULL,
	AFirstName VARCHAR(50) NOT NULL,
    AFatherName VARCHAR(50) NOT NULL,
    AGFatherName VARCHAR(50) NOT NULl,
    AFamilyName VARCHAR(50) NOT NULL,
    Gender Enum('male', 'female') NOT NULL,
    PhoneNo VARCHAR(15) NOT NULL,
    E_mail VARCHAR(320) NOT NULL,
    Facebook_Link VARCHAR(75) NOT NULL,
    UniStartYear int NOT NULL,
    MembershipStatus ENUM('Active', 'Inactive') NOT NULL,
    LC ENUM('Nablus', 'Jerusalem', 'Gaza', 'HU', 'PPU', 'Jinin') NOT NULL,
    CONSTRAINT FkeyLC FOREIGN KEY (LC) REFERENCES LocalCommittees (city) 
    ON UPDATE CASCADE,
    CONSTRAINT chk_year CHECK ( UniStartYear > 1960 )
);

CREATE TABLE memeber_trainers (
	UniID INT PRIMARY KEY ,
    Category varchar(30) NOT NULL,
    GradActivity varchar(50) NOT NULL,
    GradDate date NOT NULL,
    TStatus ENUM('Active','Inactive'),
    CONSTRAINT FkeyUniID FOREIGN KEY (UniID) REFERENCES members(UniID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE memberBlacklist(
	UniID INT PRIMARY KEY,
    CONSTRAINT FkeyUniID1 FOREIGN KEY (UniID) REFERENCES members(UniID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE activities(
	ActivityID INT PRIMARY KEY AUTO_INCREMENT,
    Aname VARCHAR(50) NOT NULL,
    Committee ENUM ('SCOPE', 'SCORE', 'SCORP', 'SCOPH', 'SCORA', 'SCOME', 'General', 'CB') NOT NULL,
    Adescription VARCHAR(500) NOT NULL,
    ProposalLink VARCHAR(300) NOT NULL,
    ReportLink VARCHAR (300) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL
);

CREATE TABLE members_activities(
	UniID INT,
    ActivityID INT,
    CertCode INT NOT NULL,
    CONSTRAINT PkeyUIDAID PRIMARY KEY (UniID, ActivityID),
    CONSTRAINT FKeyUniIDMemAct FOREIGN KEY (UniID) REFERENCES members(UniID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT FKeyAIDMemAct FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
    
);

CREATE TABLE localActivities(
	ActivityID INT PRIMARY KEY,
    LC ENUM('Nablus', 'Jerusalem', 'Gaza', 'HU', 'PPU', 'Jinin') NOT NULL,
    CONSTRAINT FkeyActivityID FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE, 
    CONSTRAINT FkeyLCLA FOREIGN KEY (LC) REFERENCES LocalCommittees (city)
    ON UPDATE CASCADE
);

CREATE TABLE nationalActivities(
	ActivityID INT PRIMARY KEY,
    CONSTRAINT FkeyActivityIDNatAct FOREIGN KEY (ActivityID) REFERENCES activities (ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE nationalActivities_localCommittees(
	ActivityID INT NOT NULL,
	LC ENUM('Nablus', 'Jerusalem', 'Gaza', 'HU', 'PPU', 'Jinin') NOT NULL,
    CONSTRAINT PkeyAIDLC PRIMARY KEY (ActivityID, LC),
    CONSTRAINT FkeyActivityIDRel FOREIGN KEY (ActivityID) REFERENCES nationalActivities (ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT FkeyLCRel FOREIGN KEY (LC) REFERENCES LocalCommittees (city)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE standingCommittees(
	ComitteeID INT PRIMARY KEY AUTO_INCREMENT,
    ComitteeName varchar(50) NOT NULL,
    ActStatus ENUM ('Active', 'Inactive') NOT NULL
);

-- create Activities