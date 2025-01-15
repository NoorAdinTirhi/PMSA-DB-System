DO NOT RUN THIS EVER AFTER FIRST CREATION AND INSERTING DATA, ALL DATA WILL THEN BE REMOVED

DROP DATABASE PMSA_DB;

CREATE DATABASE PMSA_DB;

USE PMSA_DB; 


CREATE TABLE Users(
	Username VARCHAR(50) PRIMARY KEY,
    Hmac VARCHAR(64) NOT NULL,
    Hkey VARCHAR(128) NOT NULL,
    Position ENUM('Secgen', 'CBD') NOT NULL,
    
    Locality ENUM('national','nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jenin') NOT NULL,
    LastAction VARCHAR(500),
    LastActionTime DATE,
    StartDate DATE,
    UNIQUE KEY localPosition (Position, Locality)
)ENGINE=INNODB;

INSERT INTO Users (Username, Hmac, Hkey,Position, Locality) VALUES ('noor', '14b95c8a801504ac2bd1aeddcbdd74adbe91e951db1f435355538be6cd9391fe', '28,54,23,16,252,42,160,50,245,169,9,88,221,113,238,156,243,238,109,5,55,207,102,189,229,88,102,125,242,164,1,57', 'Secgen', 'National');
INSERT INTO Users (Username, Hmac, Hkey,Position, Locality) VALUES ('admin', '060e5db75dab203b0a106b0f225c82291c64fbd5e025c0505d32fcf7564af02d', '28,54,23,16,252,42,160,50,245,169,9,88,221,113,238,156,243,238,109,5,55,207,102,189,229,88,102,125,242,164,1,57', 'Secgen', 'National');

CREATE TABLE LocalCommittees
(
	city ENUM('nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jenin') PRIMARY KEY,
    membershipStatus ENUM('Full','Canditate') NOT NULL
    -- will want to know number of members
    -- will want to know number of activities
    -- will want to know number of trainers
)ENGINE=INNODB;


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
    LC                  ENUM('nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jenin') NOT NULL,
    CONSTRAINT FkeyLC FOREIGN KEY (LC) REFERENCES LocalCommittees (city) 
    ON UPDATE CASCADE,
    CONSTRAINT chk_year CHECK ( UniStartYear > 1960 )
)ENGINE=INNODB;

CREATE TABLE memeber_trainers (
	UniID INT PRIMARY KEY ,
    Category varchar(30) NOT NULL,
    GradActivity varchar(50) NOT NULL,
    GradDate date NOT NULL,
    TStatus ENUM('Active','Inactive'),
    CONSTRAINT FkeyUniID FOREIGN KEY (UniID) REFERENCES members(UniID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)ENGINE=INNODB;

CREATE TABLE memberBlacklist(
	UniID INT PRIMARY KEY,
    Status ENUM ('red', 'orange', 'yellow', 'blue', 'green', 'exchange', 'clear') NOT NULL,
    Reason VARCHAR(50)  NOT NULL,
    CONSTRAINT FkeyUniID1 FOREIGN KEY (UniID) REFERENCES members(UniID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)ENGINE=INNODB;

CREATE TABLE activities(
	ActivityID      INT PRIMARY KEY AUTO_INCREMENT,
    Aname           VARCHAR(50) NOT NULL,
    Committee       ENUM ('SCOPE', 'SCORE', 'SCORP', 'SCOPH', 'SCORA', 'SCOME', 'General', 'CB') NOT NULL,
    Adescription    VARCHAR(500) NOT NULL,
    ProposalLink    VARCHAR(300) NOT NULL,
    ReportLink      VARCHAR (300) NOT NULL,
    StartDate       DATE NOT NULL,
    EndDate         DATE NOT NULL
)ENGINE=INNODB;


CREATE TABLE members_activities(
	UniID INT,
    ActivityID INT,
    CertCode INT NOT NULL,
    Position VARCHAR(50) NOT NULL,
    CONSTRAINT PkeyUIDAID PRIMARY KEY (UniID, ActivityID),
    CONSTRAINT FKeyUniIDMemAct FOREIGN KEY (UniID) REFERENCES members(UniID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT FKeyAIDMemAct FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
    
)ENGINE=INNODB;

CREATE TABLE localActivities(
	ActivityID INT PRIMARY KEY,
    LC ENUM('nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jenin') NOT NULL,
    CONSTRAINT FkeyActivityID FOREIGN KEY (ActivityID) REFERENCES activities(ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE, 
    CONSTRAINT FkeyLCLA FOREIGN KEY (LC) REFERENCES LocalCommittees (city)
    ON UPDATE CASCADE
)ENGINE=INNODB;

CREATE TABLE nationalActivities(
	ActivityID INT PRIMARY KEY,
    Anum			INT,
    FOREIGN KEY (ActivityID) REFERENCES activities (ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)ENGINE=INNODB;

CREATE TABLE nationalActivities_localCommittees(
	ActivityID INT NOT NULL,
	LC ENUM('nablus', 'jerusalem', 'gaza', 'hu', 'ppu', 'jenin') NOT NULL,
    CONSTRAINT PkeyAIDLC PRIMARY KEY (ActivityID, LC),
    CONSTRAINT FkeyActivityIDRel FOREIGN KEY (ActivityID) REFERENCES nationalActivities (ActivityID)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    CONSTRAINT FkeyLCRel FOREIGN KEY (LC) REFERENCES LocalCommittees (city)
    ON DELETE CASCADE
    ON UPDATE CASCADE
)ENGINE=INNODB;

CREATE TABLE standingCommittees(
	ComitteeID INT PRIMARY KEY AUTO_INCREMENT,
    ComitteeName varchar(50) NOT NULL,
    ActStatus ENUM ('Active', 'Inactive') NOT NULL
)ENGINE=INNODB;

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

CREATE TRIGGER NationalActivityNumber
    BEFORE INSERT ON Na
    FOR EACH ROW 
 	SET NEW.Anum = IFNULL((SELECT (Max(Anum)+1) FROM A,Na WHERE A.ActivityID = Na.ActivityID AND A.Committee = (SELECT Committee FROM A WHERE ActivityID = NEW.ActivityID)), 0);

    
CREATE TRIGGER update_member_number 
    BEFORE INSERT ON M_A
    FOR EACH ROW 
 	SET NEW.CertCode = IFNULL((SELECT (Max(CertCode)+1) FROM M_A WHERE  ActivityID = NEW.ActivityID), 0);

INSERT INTO LC VALUES
	('nablus', 'Full'),
    ('gaza','Full'),
    ('hu','Full'),
    ('ppu','Full'),
    ('jenin','Full'),
    ('jerusalem', 'Full');


-- SELECT IFNULL((SELECT * FROM M_A, A, Na WHERE M_A.ActivityID = Na.ActivityID AND A.ActivityID = Na.ActivityID AND A.ActivityID = 1),(SELECT UniID, CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) AS Name FROM M WHERE CONCAT(FirstName, " ", FatherName, " ",GFatherName, " ",FamilyName) LIKE '%${body.memberLike}%' AND UniID IN (SELECT UniID FROM M_A WHERE ActivityID = ) ))

-- SELECT  A.Committee AS Committee, CONCAT(M.FirstName, " ",M.FatherName, " ", M.GFatherName, " ", M.FamilyName) AS Name,
-- A.Aname, DATE_FORMAT(StartDate,'%Y/%m/%d') AS StartDate1, DATE_FORMAT(EndDate,'%Y/%m/%d') AS EndDate1,
-- M_A.position AS Position, M_A.CertCode AS memNumPerA, Na.Anum AS Anum 
-- FROM M, M_A, Na, A
-- WHERE M_A.ActivityID = A.ActivityID AND A.ActivityID = Na.ActivityID AND M_A.UniID = M.UniID AND M.UniID = 1190083 AND A.ActivityID = 11