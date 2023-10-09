-- DO NOT RUN THIS EVER AFTER FIRST CREATION AND INSERTING DATA, ALL DATA WILL THEN BE REMOVED

DROP DATABASE PMSA_DB;

CREATE DATABASE PMSA_DB;

USE PMSA_DB; 


CREATE TABLE Users(
	Username VARCHAR(50) PRIMARY KEY,
    Hmac VARCHAR(64) NOT NULL,
    Hkey VARCHAR(128) NOT NULL,
    Position ENUM('Secgen', 'CBD') NOT NULL,
    
    Locality ENUM('national','nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jinin') NOT NULL,
    LastAction VARCHAR(500),
    LastActionTime DATE,
    StartDate DATE
);

INSERT INTO Users (Username, Hmac, Hkey,Position, Locality) VALUES ('noor', '14b95c8a801504ac2bd1aeddcbdd74adbe91e951db1f435355538be6cd9391fe', '28,54,23,16,252,42,160,50,245,169,9,88,221,113,238,156,243,238,109,5,55,207,102,189,229,88,102,125,242,164,1,57', 'Secgen', 'National');

CREATE TABLE LocalCommittees
(
	city ENUM('nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jinin') PRIMARY KEY,
    membershipStatus ENUM('Full','Canditate') NOT NULL
    -- will want to know number of members
    -- will want to know number of activities
    -- will want to know number of trainers
);


CREATE TABLE members(
	UniID 				INT      PRIMARY KEY,
    FirstName           VARCHAR(50) NOT NULL,
    FatherName          VARCHAR(50) NOT NULL,
    GFatherName         VARCHAR(50) NOT NULL,
    FamilyName          VARCHAR(50) NOT NULL,
	AFirstName          VARCHAR(50) NOT NULL,
    AFatherName         VARCHAR(50) NOT NULL,
    AGFatherName        VARCHAR(50) NOT NULl,
    AFamilyName         VARCHAR(50) NOT NULL,
    Gender              Enum('male', 'female') NOT NULL,
    PhoneNo             VARCHAR(15) NOT NULL,
    E_mail              VARCHAR(320) NOT NULL,
    Facebook_Link       VARCHAR(75) NOT NULL,
    UniStartYear        int NOT NULL,
    MembershipStatus    ENUM('Active', 'Inactive') NOT NULL,
    LC                  ENUM('nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jinin') NOT NULL,
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
    Status ENUM ("red, orange, yellow, blue, green, exchange") NOT NULL,
    Reason VARCHAR(50)  NOT NULL,
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
    LC ENUM('nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jinin') NOT NULL,
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
    ON UPDATE CASCADE,
    CONSTRAINT FkeyLActivityID FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE nationalActivities_localCommittees(
	ActivityID INT NOT NULL,
	LC ENUM('nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jinin') NOT NULL,
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

ALTER TABLE LocalCommittees RENAME LC;
ALTER TABLE members RENAME M;
ALTER TABLE memeber_trainers RENAME Mt;
ALTER TABLE memberBlacklist RENAME MBl;
ALTER TABLE activities RENAME A;
ALTER TABLE members_activities RENAME M_A;
ALTER TABLE localActivities RENAME La;
ALTER TABLE nationalActivities RENAME Na;
ALTER TABLE nationalActivities_localCommittees RENAME NaLC;
ALTER TABLE standingCommittees RENAME SC;



INSERT INTO LC VALUES ('nablus', 'Full');

INSERT INTO M  VALUES (1190081, 'nooradin', 'fuad', 'haider', 'tirhi', 'نورالدين' , 'فؤاد', 'حيدر', 'ترهي', 'male', '972584280013', 'nooradintirhi@gmail.com', 'https://www.facebook.com/nooraldeen.tirhi/', 2019, 'Active', 'nablus');


-- SELECT *, DATE_FORMAT(StartDate,'%d/%m/%Y') AS StartDate1, DATE_FORMAT(LastActionTime,'%d/%m/%Y') AS LastActionTime1 FROM Users;

-- SELECT * FROM M;

-- SELECT * FROM M_A;

-- national activities
-- SELECT A.Aname FROM M_A, A WHERE M_A.ActivityID = A.ActivityID AND UniID = 1190081 AND A.ActivityID IN (SELECT Na.ActivityID FROM Na);
-- SELECT A.Aname, A.ActivityID, A.Committee FROM M_A, A WHERE M_A.ActivityID = A.ActivityID AND UniID = 1190081 AND A.ActivityID IN (SELECT Na.ActivityID FROM Na)

-- SELECT * FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID > 0 ORDER BY M.UniID LIMIT 1;

-- INSERT INTO Mt VALUE(1190081, "noor's Category","noorification", '1999-03-20',  'Active')

-- SELECT * FROM M, Mt WHERE M.UniID = Mt.UniID and M.UniID > 0 ORDER BY M.UniID LIMIT 1

-- select * FROM M;

