Create Table LoginInfo(
  LoginId Serial Primary Key,
  Email varchar(100),
  Password Text   -- Widened from varchar(50) to TEXT to support password hashes
);

Create Table Users(
  UserId Serial Primary Key,
  LoginId int references LoginInfo(LoginId) On delete cascade On update cascade,
  UserType varchar(10) Check(UserType in ('Student','Hostel Manager','Admin')),
  Fname varchar(50),
  Lname varchar(50),
  Age int Check(Age>0 AND Age<100),
  Gender varchar(10) Check(Gender in ('Male','Female','Other')),
  City varchar(100)
);

Alter table Users
Alter column UserType Type varchar(50);

Create Table StudentDemoGraphics(
  StudentId int Primary Key references Users(UserId) On delete cascade On update cascade,
  Semester int CHECK(Semester>=1 AND Semester<=8),
  Department Text,
  Batch int,
  RoomateCount int CHECK(RoomateCount>=1 AND RoomateCount<=6),
  UniDistance float,
  isAcRoom boolean,
  isMess boolean,
  BedType varchar(50) CHECK(BedType in ('Bed','Mattress','Anyone')),
  WashroomType varchar(50) CHECK(WashroomType in ('RoomAttached','Community'))
);

Create Table AppSuggestions(
  SuggestionId Serial,
  UserId int references Users(UserId) On delete cascade On update cascade,
  Primary Key(UserId, SuggestionId),
  Improvements Text,
  Defects Text
);

Create Table HostelManager(
  ManagerId int Primary Key references Users(UserId) On delete cascade On update cascade,
  PhotoLink Text,
  PhoneNo int,
  Education varchar(50),
  ManagerType varchar(50) CHECK(ManagerType in ('Owner','Employee')),
  OperatingHours int CHECK(OperatingHours>=1 AND OperatingHours<=24)
);

Alter table hostelmanager
Alter column PhoneNo Type char(11);

Create Table Hostel(
  HostelId Serial Primary Key,
  ManagerId int references HostelManager(ManagerId) On delete cascade On update cascade,
  BlockNo int,           -- Changed to varchar(100)
  HouseNo int,           -- Changed to varchar(100)
  HostelType varchar(50) CHECK(HostelType in ('Portion','Building')),
  isParking boolean,
  NumRooms int,
  NumFloors int,
  WaterTimings Time,
  CleanlinessTenure int,
  IssueResolvingTenure int,
  MessProvide boolean,
  GeezerFlag boolean
);

Alter table hostel
Alter column BlockNo Type varchar(100);

Alter table hostel
Alter column HouseNo Type varchar(100);

Alter table hostel
Add column Name text default 'Student Hostel';

Create Table HostelPics(
  PicId Serial,
  HostelId int references Hostel(HostelId) On delete cascade On update cascade,
  Primary Key(HostelId, PicId),
  PhotoLink Text
);

-- If Manager is uploading hostel pic then consider RoomSeaterNo: -1 ,
-- else Manager will provide RoomSeaterNo while uploading RoomPic
-- The boolean tells whether hostel pics or room pics
Alter Table HostelPics
Add Column isHostelPic boolean,
Add Column RoomSeaterNo int Default -1;

Create Table MessDetails(
  MessId int Primary Key references Hostel(HostelId) On delete cascade On update cascade,
  MessMeals int CHECK(MessMeals>=1 AND MessMeals<=3)
);

Alter table MessDetails
Add column Dishes text[];

Create Table KitchenDetails(
  KitchenId int Primary Key references Hostel(HostelId) On delete cascade On update cascade,
  isFridge boolean,
  isMicrowave boolean,
  isGas boolean
);

Create Table RoomInfo(
  RoomId int,
  HostelId int references Hostel(HostelId) On delete cascade On update cascade,
  Primary Key(HostelId, RoomId),
  FloorNo int,
  SeaterNo int,
  BedType varchar(20) CHECK(BedType in ('Bed','Mattress')),
  WashroomType varchar(20) CHECK(WashroomType in ('RoomAttached','Community')),
  CupboardType varchar(20) CHECK(CupboardType in ('PerPerson','Shared')),
  isVentilated boolean,
  isCarpet boolean,
  isMiniFridge boolean
);

Alter Table RoomInfo
Add Column RoomRent float;

Create Table SecurityInfo(
  SecurityId int Primary Key references Hostel(HostelId) On delete cascade On update cascade,
  GateTimings Time,
  isCameras boolean,
  isGuard boolean,
  isOutsiderVerification boolean
);

-- If Manager selects Expenses included in room rent, then just show room and security charges
-- and other are by default 0, else other are inputted by manager and are displayed also
Create Table Expenses(
  ExpenseId int Primary Key references Hostel(HostelId) On delete cascade On update cascade,
  isIncludedInRoomCharges boolean,
  RoomCharges float[],               -- include the charges based on RoomSeaterNo
  SecurityCharges float,
  MessCharges float Default 0,
  KitchenCharges float Default 0,
  InternetCharges float Default 0,
  AcServiceCharges float Default 0,
  -- These Types will be translated in frontend
  ElectricitybillType Text CHECK(ElectricitybillType in ('RoomMeterFull','RoomMeterACOnly','ACSubmeter','UnitBased')),
  ElectricityCharges float Default 0
);

Create Table HostelRating(
  RatingId Serial,
  HostelId int references Hostel(HostelId) On delete cascade On update cascade,
  StudentId int references StudentDemoGraphics(StudentId) On delete cascade On update cascade,
  Primary Key(HostelId, StudentId, RatingId),
  RatingStar int CHECK(RatingStar>=1 AND RatingStar<=5),
  MaintenanceRating int Check(MaintenanceRating>=1 AND MaintenanceRating<=5),
  IssueResolvingRate int,
  ManagerBehaviour int Check(ManagerBehaviour>=1 AND ManagerBehaviour<=5),
  Challenges Text
);

Select * from LoginInfo;
Select * from Users;
Select * from studentdemographics;
Select * from appsuggestions;
Select * from hostelmanager;
Select * from hostel;
Select * from hostelpics;
Select * from messdetails;
Select * from kitchendetails;
Select * from roominfo;
Select * from securityinfo;
Select * from expenses;
Select * from hostelrating;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Procedures for Insertion and Deletion and no return data
-- Functions in case need to return something

-- 1, User Signup i.e. Creating an acount
Create or Replace function Signup(
  UserType varchar(10),
  Fname varchar(50),
  Lname varchar(50),
  Age int,
  Gender varchar(10),
  City varchar(100),
  email varchar(100),
  password varchar(50)
) Returns int as $$
Declare
  p_loginId int;
  p_userId int;
Begin
  if exists(Select 1 from LoginInfo L where L.Email = Signup.email) then
    return 0;     -- Acount with this email already exists
  End if;

  Insert into LoginInfo(Email, Password)
  values(email, password)
  Returning loginid into p_loginId;

  if Gender in ('Male','Female','Other') AND UserType in ('Student','Hostel Manager','Admin') then
    Insert into Users(loginid, usertype, fname, lname, age, gender, city)
    values(p_loginId, UserType, Fname, Lname, Age, Gender, City)
    Returning UserId into p_userId;
    Return p_userId;
  else
    Return -1;       --Invalid Credentials
  End if;
End;
$$ LANGUAGE plpgsql;

--Select * from signin('Admin','Arham','Zeeshan',20,'Male','Sialkot','arhamzeeshan617@gmail.com','Playstation0896');
Select * from signup('Admin','Fezan','Shamshad',20,'Male','Sialkot','fezan617@gmail.com','Playstation0896');
Select * from Users;

--2, Print All the Users
Create or Replace function GetAllUsers()
Returns Table(
  UserId int,
  LoginId int,
  UserType varchar(10),
  Fname varchar(50),
  Lname varchar(50),
  Age int,
  Gender varchar(10),
  City varchar(100)
) As $$
Begin
  Return Query
  Select * from Users;
End;
$$ LANGUAGE plpgsql;

Select * from getallusers();

--3, User Login i.e. Login with Existing Acount
Create or Replace function Login(
  email varchar(100),
  password varchar(50)
) Returns boolean as $$
Begin
  if exists(Select 1 from LoginInfo L where L.Email = Login.email AND L.Password = Login.password) then
    Return true;
  End if;

  Return false;       -- Invalid Email or Password
End;
$$ LANGUAGE plpgsql;

Select * from Login('arhamzeeshan617@gmail.com','Playstation0896');

--4 Enter Student DemoGraphics
Create or Replace function EnterStudentDetails(
  UserId int,
  Semester int,
  Department Text,
  Batch int,
  RoomateCount int,
  UniDistance float,
  isAcRoom boolean,
  isMess boolean,
  BedType varchar(50),
  WashroomType varchar(50)
) Returns boolean as $$
Begin
  if not exists(Select 1 from Users U where U.UserId = EnterStudentDetails.UserId) then
    Return false;
  End if;

  if (Semester>=1 AND Semester<=8) AND (RoomateCount>=1 AND RoomateCount<=6)
     AND BedType in ('Bed','Mattress','Anyone') AND WashroomType in ('RoomAttached','Community') then

    Insert into studentdemographics
    values(UserId, Semester, Department, Batch, RoomateCount, UniDistance, isAcRoom, isMess, BedType, WashroomType);

    Return true;
  End if;

  Return false;
End;
$$ LANGUAGE plpgsql;

Select * from enterstudentdetails(1,5,'CS','2023',3,20.5,true,false,'Bed','RoomAttached');
Select * from studentdemographics;

-- 5, Update Student DemoGraphics
Create or Replace function UpdateStudentDetails(
  p_StudentId int,
  p_Semester int,
  p_Department Text,
  p_Batch int,
  p_RoomateCount int,
  p_UniDistance float,
  p_isAcRoom boolean,
  p_isMess boolean,
  p_BedType varchar(50),
  p_WashroomType varchar(50)
) Returns boolean as $$
Begin
  if not exists(Select 1 from StudentDemoGraphics where StudentId = p_StudentId) then
    return false;
  End if;

  UPDATE studentdemographics
  SET
    semester      = COALESCE(p_semester, semester),
    department    = COALESCE(p_department, department),
    batch         = COALESCE(p_batch, batch),
    roomatecount  = COALESCE(p_roomatecount, roomatecount),
    unidistance   = COALESCE(p_unidistance, unidistance),
    isacroom      = COALESCE(p_isacroom, isacroom),
    ismess        = COALESCE(p_ismess, ismess),
    bedtype       = COALESCE(p_bedtype, bedtype),
    washroomtype  = COALESCE(p_washroomtype, washroomtype)
  WHERE studentid = p_studentid;

  return true;
End;
$$ LANGUAGE plpgsql;

Select * from updatestudentdetails(1,5,'CS','2023',3,16.5,true,false,'Bed','RoomAttached');
Select * from updatestudentdetails(1,NULL,NULL,NULL,NULL,16.5,NULL,NULL,'Mattress',NULL);
Select * from studentdemographics;

-- 6, Enter App Suggestions by User(Student/Manager)
Create or Replace function AddAppSuggestion(
  p_UserId int,
  p_Improvements Text,
  p_Defects Text
) Returns boolean as $$
Begin
  if not exists(Select 1 from Users where UserId = p_UserId) then
    return false;
  End if;

  Insert into AppSuggestions(UserId, Improvements, Defects)
  values(p_UserId, p_Improvements, p_Defects);

  return true;
End;
$$ LANGUAGE plpgsql;

Select * from AddAppSuggestion(1,'More Mess Details','UX broken to some extent');
Select * from appsuggestions;

--7, Add Hostel Manager Details
Create or Replace function AddManagerDetails(
  p_UserId int,
  p_PhotoLink Text,
  p_PhoneNo char(11),
  p_Education varchar(50),
  p_ManagerType varchar(50),
  p_OperatingHours int
) Returns boolean as $$
Begin
  if not exists(Select 1 from Users where UserId = p_UserId) then
    return false;
  End if;

  -- This check ensures that student cannot create another Manager Acount
  if exists(Select 1 from StudentDemographics where StudentId = p_UserId) then
    return false;
  End if;

  if p_ManagerType in ('Owner','Employee') and (p_OperatingHours>=1 AND p_OperatingHours<=24) then
    Insert into HostelManager
    values(p_UserId, p_PhotoLink, p_PhoneNo, p_Education, p_ManagerType, p_OperatingHours);
    return true;
  End if;

  return false;
End;
$$ LANGUAGE plpgsql;

Select * from AddManagerDetails(2,'someurl','03324434300','BS CS','Owner',8);

--8, Update HostelManager Details
Create or Replace function UpdateManagerDetails(
  p_ManagerId int,
  p_PhotoLink Text,
  p_PhoneNo char(11),
  p_Education varchar(50),
  p_ManagerType varchar(50),
  p_OperatingHours int
) Returns boolean as $$
Begin
  if not exists(Select 1 from HostelManager where managerid = p_ManagerId) then
    return false;
  End if;

  if p_ManagerType in ('Owner','Employee') and (p_OperatingHours>=1 AND p_OperatingHours<=24) then
    Update HostelManager
    set photolink = COALESCE(p_PhotoLink, photolink),
        phoneno = COALESCE(p_PhoneNo, phoneno),
        education = COALESCE(p_Education, education),
        managertype = COALESCE(p_ManagerType, managertype),
        operatinghours = COALESCE(p_OperatingHours, operatinghours)
    where managerid = p_ManagerId;
    return true;
  End if;

  return false;
End;
$$ LANGUAGE plpgsql;

Select * from UpdateManagerDetails(2,'someurl','03324434300','BS CS','Owner',7);
Select * from hostelmanager;

--9, Delete HostelManager (Used by SuperAdmin)
Create or Replace function DeleteHostelManager(
  p_ManagerId int
) Returns boolean as $$
Begin
  if not exists(Select 1 from hostelmanager where managerid = p_ManagerId) then
    return false;
  End if;

  Delete from hostelmanager
  where managerid = p_ManagerId;

  return true;
End;
$$ LANGUAGE plpgsql;

Select * from DeleteHostelManager(1);

--10, Add Hostel Details (Hostel Manager can add his hostel details)
Create or Replace function AddHostelDetails(
  p_ManagerId int,
  p_BlockNo varchar(100),
  p_HouseNo varchar(100),
  p_HostelType varchar(50),
  p_isParking boolean,
  p_NumRooms int,
  p_NumFloors int,
  p_WaterTimings Time,
  p_CleanlinessTenure int,       -- In Days
  p_IssueResolvingTenure int,    -- In Days
  p_MessProvide boolean,
  p_GeezerFlag boolean,
  p_name text
) Returns int as $$
Begin
  if not exists(Select 1 from HostelManager where Managerid = p_ManagerId) then
    return 0;           -- Error: Manager with this id does not exists
  End if;

  if exists(Select 1 from hostel where blockno = p_BlockNo and houseno = p_HouseNo) then
    return -1;          -- Error: Hostel with this BlockNo and HouseNo already exists
  End if;

  if p_HostelType in ('Portion','Building') then
    Insert into Hostel(managerid, blockno, houseno, hosteltype, isparking, numrooms, numfloors, watertimings, cleanlinesstenure, issueresolvingtenure, messprovide, geezerflag, name)
    values(p_ManagerId, p_BlockNo, p_HouseNo, p_HostelType, p_isParking, p_NumRooms, p_NumFloors, p_WaterTimings,       p_CleanlinessTenure, p_IssueResolvingTenure, p_MessProvide, p_GeezerFlag, p_name);
    return 1;           -- Hostel Added Successfully
  End if;

  return -2;            -- Error: Invalid Hostel Type
End;
$$ LANGUAGE plpgsql;

Select * from addhosteldetails(9, 'Block A', 'House no 11', 'Portion', true, 6, 2, '11:30', 7, 7, true, true, 'Bhatti Club');
Select * from hostel;

--11, Update Hostel Details (Hostel Manager can update his hostel details)
Create or Replace function UpdateHostelDetails(
  p_HostelId int,
  p_BlockNo varchar(100),
  p_HouseNo varchar(100),
  p_HostelType varchar(50),
  p_isParking boolean,
  p_NumRooms int,
  p_NumFloors int,
  p_WaterTimings Time,
  p_CleanlinessTenure int,      -- In Days
  p_IssueResolvingTenure int,   -- In Days
  p_MessProvide boolean,
  p_GeezerFlag boolean,
  p_name text
) Returns boolean as $$
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return false;
  End if;

  if p_HostelType in ('Portion','Building') then
    Update Hostel
    set blockno = COALESCE(p_BlockNo, blockno),
        houseno = COALESCE(p_HouseNo, houseno),
        hosteltype = COALESCE(p_HostelType, hosteltype),
        isparking = COALESCE(p_isParking, isparking),
        numrooms = COALESCE(p_NumRooms, numrooms),
        numfloors = COALESCE(p_NumFloors, numfloors),
        watertimings = COALESCE(p_WaterTimings, watertimings),
        cleanlinesstenure = COALESCE(p_CleanlinessTenure, cleanlinesstenure),
        issueresolvingtenure = COALESCE(p_IssueResolvingTenure, issueresolvingtenure),
        messprovide = COALESCE(p_MessProvide, messprovide),
        geezerflag =  COALESCE(p_GeezerFlag, geezerflag),
        name = COALESCE(p_name, name)
    where hostelid = p_HostelId;
    return true;
  End if;

  return false;
End;
$$ LANGUAGE plpgsql;

--12, Delete Hostel Details (Hostel Manager can delete his hostel)
Create or Replace function DeleteHostelDetails(
  p_HostelId int
) Returns boolean as $$
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return false;
  End if;

  Delete from hostel
  where hostelid = p_HostelId;

  return true;
End;
$$ LANGUAGE plpgsql;

--13, Add Hostel Pictures (Note: Not room pictures just hostel pictures)
Create or Replace function AddHostelPics(
  p_HostelId int,
  p_PhotoLink text
) Returns boolean as $$
Declare
  p_isHostelPic boolean;
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return false;
  End if;

  p_isHostelPic := true;
  Insert into HostelPics(hostelid, photolink, ishostelpic)
  values(p_HostelId, p_PhotoLink, p_isHostelPic);

  return true;
End;
$$ LANGUAGE plpgsql;

--14, Add Room Pictures (Manager can specify room seaterno and add its pictures)
Create or Replace function AddRoomPics(
  p_HostelId int,
  p_PhotoLink text,
  p_RoomSeaterNo int        --Range from 1 to 6
) Returns boolean as $$
Declare
  p_isHostelPic boolean;
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return false;
  End if;

  p_isHostelPic := false;
  Insert into HostelPics(hostelid, photolink, ishostelpic, roomseaterno)
  values(p_HostelId, p_PhotoLink, p_isHostelPic, p_RoomSeaterNo);

  return true;
End;
$$ LANGUAGE plpgsql;

--15, Delete Hostel Picture (Manager can Delete hostel pictures)
Create or Replace function DeleteHostelPic(
  p_PicId int
) Returns boolean as $$
Begin
  if not exists(Select 1 from hostelpics where picid = p_PicId) then
    return false;
  End if;

  Delete from hostelpics
  where picid = p_PicId;

  return true;
End;
$$ LANGUAGE plpgsql;

--16, Add Mess Details (Hostel Manager can add mess details)
Create or Replace function AddMessDetails(
  p_HostelId int,
  p_MessTimeCount int,        -- Range (1 to 3)
  p_Dishes text[]             -- Input Array of strings
) Returns int as $$
Declare
  isMessProvide boolean;
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return -1;    -- Error: Hostel Does not exists
  End if;

  Select messprovide into isMessProvide from Hostel
  where hostelid = p_HostelId;

  if not isMessProvide then
    return 0;     -- Error: Hostel does not provide Mess
  End if;

  if p_MessTimeCount>=1 and p_MessTimeCount<=3 then
    Insert into MessDetails(messid, messmeals, dishes)
    values(p_HostelId, p_MessTimeCount, p_Dishes);
    return 1;     -- Mess Details Added Successfuly
  End if;

  return -2;      -- Error: Mess Meal Count Ranges from( 1 to 3)
End;
$$ LANGUAGE plpgsql;

--17, Update Mess Details (Manager can Update Mess Details)
Create or Replace function UpdateMessDetails(
  p_MessId int,
  p_MessTimeCount int,        -- Range (1 to 3)
  p_Dishes text[]             -- Input Array of strings
) Returns int as $$
Begin
  if not exists(Select 1 from messdetails where messid = p_MessId) then
    return -1;    -- Error: Mess Info Does not exists
  End if;

  if p_MessTimeCount>=1 and p_MessTimeCount<=3 then
    Update MessDetails
    set messmeals = COALESCE(p_MessTimeCount, messmeals),
        dishes = COALESCE(p_Dishes, messmeals)
    where messid = p_MessId;
    return 1;     -- Mess Details Updated Successfuly
  End if;

  return 0;      -- Error: Mess Meal Count Ranges from( 1 to 3)
End;
$$ LANGUAGE plpgsql;

--18, Add new Dish to Hostel Mess (Manager can Update his mess to add a dish)
Create or Replace function AddNewDish(
  p_MessId int,
  p_Dish text
) Returns boolean as $$
Begin
  if not exists(Select 1 from messdetails where messid = p_MessId) then
    return false;
  End if;

  Update messdetails
  set dishes = array_append(dishes, p_Dish)
  where messid = p_MessId;

  return true;
End;
$$ LANGUAGE plpgsql;

--19, Delete Hostel Mess Details (Manager can delete mess details)
Create or Replace function DeleteMessDetails(
  p_MessId int
) Returns boolean as $$
Begin
  if not exists(Select 1 from messdetails where messid = p_MessId) then
    return false;
  End if;

  Delete from messdetails
  where messid = p_MessId;

  return true;
End;
$$ LANGUAGE plpgsql;

--20, Add Hostel Kitchen Details (Hostel Manager can add Kitchen Details)
Create or Replace function AddKitchenDetails(
  p_HostelId int,
  p_isFridge boolean,
  p_isMicrowave boolean,
  p_isGas boolean
) Returns boolean as $$
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return false;
  End if;

  Insert into kitchendetails(kitchenid, isfridge, ismicrowave, isgas)
  values(p_HostelId, p_isFridge, p_isMicrowave, p_isGas);

  return true;
End;
$$ LANGUAGE plpgsql;

--21, Update Kitchen Details (Hostel Manager can update Kitchen Details)
Create or Replace function UpdateKitchenDetails(
  p_KitchenId int,
  p_isFridge boolean,
  p_isMicrowave boolean,
  p_isGas boolean
) Returns boolean as $$
Begin
  if not exists(Select 1 from kitchendetails where kitchenid = p_KitchenId) then
    return false;
  End if;

  Update kitchendetails
  set isfridge = COALESCE(p_isFridge, isfridge),
      ismicrowave = COALESCE(p_isMicrowave, ismicrowave),
      isgas = COALESCE(p_isGas, ismicrowave)
  where kitchenid = p_KitchenId;

  return true;
End;
$$ LANGUAGE plpgsql;

--22, Delete Kitchen Details
Create or Replace function DeleteKitchenDetails(
  p_KitchenId int
) Returns boolean as $$
Begin
  if not exists(Select 1 from kitchendetails where kitchenid = p_KitchenId) then
    return false;
  End if;

  Delete from kitchendetails
  where kitchenid = p_KitchenId;

  return true;
End;
$$ LANGUAGE plpgsql;

--23, Add Room into hostel (Manager Can add Rooms in his hostel)
Create or Replace function AddRoom(
  p_RoomNo int,
  p_HostelId int,
  p_FloorNo int,
  p_SeaterNo int,
  p_RoomRent float,
  p_BedType varchar(20),
  p_WashroomType varchar(20),
  p_CupboardType varchar(20),
  p_isVentilated boolean,
  p_isCarpet boolean,
  p_isMiniFridge boolean
) Returns int as $$
Declare
  TotalRooms int;
  CurrentRooms int;
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return 0;       -- Error: Hostel does not exists
  End if;

  if exists(Select 1 from RoomInfo where roomid = p_RoomNo) then
    return -1;      -- Error: Room with this id already exists
  End if;

  -- Check Hostel Room Limit is not full
  Select numrooms into TotalRooms from hostel
  where hostelid = p_HostelId;

  Select Count(*) into CurrentRooms from RoomInfo
  where hostelid = p_HostelId;

  if CurrentRooms >= TotalRooms then
      return -3;    -- Error: Hostel Room Limit is Full (Update Number of Rooms of Hostel)
  End if;

  if p_BedType in ('Bed','Mattress') and p_WashroomType in ('RoomAttached','Community')
     and p_CupboardType in ('PerPerson','Shared') then

     Insert into RoomInfo(hostelid, roomid, floorno, seaterno, roomrent, bedtype, washroomtype, cupboardtype, isventilated, iscarpet, isminifridge)
     values(p_HostelId, p_RoomNo, p_FloorNo, p_SeaterNo, p_RoomRent, p_BedType, p_WashroomType,
     p_CupboardType, p_isVentilated, p_isCarpet, p_isMiniFridge);

     return 1;     -- Room Added Successfully
  End if;

  return -2;       -- Error: Invalid Data Types
End;
$$ LANGUAGE plpgsql;

--24, Update Room Details
Create or Replace function UpdateRoom(
  p_RoomNo int,
  p_HostelId int,
  p_FloorNo int,
  p_SeaterNo int,
  p_RoomRent float,
  p_BedType varchar(20),
  p_WashroomType varchar(20),
  p_CupboardType varchar(20),
  p_isVentilated boolean,
  p_isCarpet boolean,
  p_isMiniFridge boolean
) Returns int as $$
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return 0;          -- Error: Hostel does not exists
  End if;

  if not exists(Select 1 from RoomInfo where roomid = p_RoomNo and hostelid = p_HostelId) then
    return -1;         -- Error: Room with this id does not exists
  End if;

  Update RoomInfo
  set floorno = coalesce(p_FloorNo, floorno),
      seaterno = coalesce(p_SeaterNo, seaterno),
      roomrent = coalesce(p_RoomRent, roomrent),
      bedtype = coalesce(p_BedType, bedtype),
      washroomtype = coalesce(p_WashroomType, washroomtype),
      cupboardtype = coalesce(p_CupboardType, cupboardtype),
      isventilated = coalesce(p_isVentilated, isventilated),
      iscarpet = coalesce(p_isCarpet, iscarpet),
      isminifridge = coalesce(p_isMiniFridge, isminifridge)
  where roomid = p_RoomNo and hostelid = p_HostelId;

  return 1;         -- Room Details Updated Successfully

End;
$$ LANGUAGE plpgsql;

--25, Delete Room Details
Create or Replace function DeleteRoom(
  p_HostelId int,
  p_RoomNo int
) Returns boolean as $$
Begin
  if not exists(Select 1 from RoomInfo where hostelid = p_HostelId and roomid = p_RoomNo) then
    return false;
  End if;

  Delete from RoomInfo
  where hostelid = p_HostelId and roomid = p_RoomNo;

  return true;
End;
$$ LANGUAGE plpgsql;

--26, Display Single Room Details
Create or Replace function DisplaySingleRoom(
  p_HostelId int,
  p_RoomNo int
)
Returns Table(
  p_FloorNo int,
  p_SeaterNo int,
  p_BedType varchar(20),
  p_WashroomType varchar(20),
  p_CupboardType varchar(20),
  p_RoomRent float,
  p_isVentilated boolean,
  p_isCarpet boolean,
  p_isMiniFridge boolean
) As $$
Begin
  Return Query
  Select floorno, seaterno, bedtype, washroomtype, cupboardtype, roomrent,
         isventilated, iscarpet, isminifridge from RoomInfo
  where hostelid = p_HostelId and roomid = p_RoomNo;
End;
$$ LANGUAGE plpgsql;

Select * from displaysingleroom(5,1);

--27, Display All Rooms of as Hostel
Create or Replace function DisplayHostelRooms(
  p_HostelId int
)
Returns Table(
  p_FloorNo int,
  p_SeaterNo int,
  p_BedType varchar(20),
  p_WashroomType varchar(20),
  p_CupboardType varchar(20),
  p_RoomRent float,
  p_isVentilated boolean,
  p_isCarpet boolean,
  p_isMiniFridge boolean
) As $$
Begin
  Return Query
  Select floorno, seaterno, bedtype, washroomtype, cupboardtype, roomrent,
         isventilated, iscarpet, isminifridge from RoomInfo
  where hostelid = p_HostelId;
End;
$$ LANGUAGE plpgsql;

Select * from displayhostelrooms(5);

--28, Display all Rooms of all Hostels
Create or Replace function DisplayAllRooms()
Returns Table(
  p_FloorNo int,
  p_SeaterNo int,
  p_BedType varchar(20),
  p_WashroomType varchar(20),
  p_CupboardType varchar(20),
  p_RoomRent float,
  p_isVentilated boolean,
  p_isCarpet boolean,
  p_isMiniFridge boolean
) As $$
Begin
  Return Query
  Select floorno, seaterno, bedtype, washroomtype, cupboardtype, roomrent,
         isventilated, iscarpet, isminifridge from RoomInfo;
End;
$$ LANGUAGE plpgsql;

Select * from displayallrooms();

--29, Add Security Details of a Hostel
Create or Replace function AddSecurityInfo(
  p_HostelId int,
  p_GateTimings Time,
  p_isCameras boolean,
  p_isGuard boolean,
  p_isOutsiderVerification boolean
) Returns boolean as $$
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return false;
  End if;

  Insert into securityinfo(securityid, gatetimings, iscameras, isguard, isoutsiderverification)
  values(p_HostelId, p_GateTimings, p_isCameras, p_isGuard, p_isOutsiderVerification);

  return true;
End;
$$ LANGUAGE plpgsql;

--30, Update Security Details of Hostel
Create or Replace function UpdateSecurityInfo(
  p_SecurityId int,
  p_GateTimings Time,
  p_isCameras boolean,
  p_isGuard boolean,
  p_isOutsiderVerification boolean
) Returns boolean as $$
Begin
  if not exists(Select 1 from SecurityInfo where securityid = p_SecurityId) then
    return false;
  End if;

  Update SecurityInfo
  set gatetimings = coalesce(p_GateTimings, gatetimings),
      iscameras = coalesce(p_isCameras, iscameras),
      isguard = coalesce(p_isGuard, isguard),
      isoutsiderverification = coalesce(p_isOutsiderVerification, isoutsiderverification)
  where securityid = p_SecurityId;

  return true;
End;
$$ LANGUAGE plpgsql;

--31, Delete Security Details of Hostel
Create or Replace function DeleteSecurityInfo(
  p_SecurityId int
) Returns boolean as $$
Begin
  if not exists(Select 1 from SecurityInfo where securityid = p_SecurityId) then
    return false;
  End if;

  Delete from SecurityInfo
  where securityid = p_SecurityId;

  return true;
End;
$$ LANGUAGE plpgsql;

--32, Display Security Details of a Single Hostel
Create or Replace function DisplayHostelSecurityInfo(
  p_HostelId int
)
Returns Table(
  p_GateTimings Time,
  p_isCameras boolean,
  p_isGuard boolean,
  p_isOutsiderVerification boolean
) as $$
Begin
  Return Query
  Select gatetimings, iscameras, isguard, isoutsiderverification from SecurityInfo
  where securityid = p_HostelId;
End;
$$ LANGUAGE plpgsql;

Select * from displayhostelsecurityinfo(1);

-- Manager can Add Expenses Details of Hostel
--33, This function will be called when manager selects Expenses included in RoomRent
Create or Replace function AddExpenses_RoomIncluded(
  p_HostelId int,
  p_SecurityCharges float
) Returns boolean as $$
Declare
  RoomRents float[];
Begin
  if not exists(Select 1 from Hostel where hostelid = p_HostelId) then
    return false;
  End if;

  -- Extract Room Charges per unique Seator Number and insert into Expense Table
  Select Array(
    Select AVG(RoomRent) from RoomInfo
    where hostelid = p_HostelId
    Group by seaterno
    Order by seaterno
  ) Into RoomRents;

  Insert into Expenses(expenseid, securitycharges, electricitybilltype, roomcharges, isincludedinroomcharges)
  values(p_HostelId, p_SecurityCharges, 'RoomMeterACOnly', RoomRents, true);
  return true;
End;
$$ LANGUAGE plpgsql;

Select * from addexpenses_roomincluded(5, 32000);
Select * from expenses;

--34, This function will be called when manager does not select Expenses included in RoomRent
Create or Replace function AddExpenses(
  p_HostelId int,
  p_SecurityCharges float,
  p_MessCharges float,
  p_KitchenCharges float,
  p_InternetCharges float,
  p_AcServiceCharges float,
  p_ElectricitybillType Text,
  p_ElectricityCharges float
) Returns int as $$
Declare
  RoomRents float[];
Begin
  if not exists(Select 1 from Hostel where hostelid = p_HostelId) then
    return 0;            -- Error: Hostel does not exists
  End if;

  if p_ElectricitybillType in ('RoomMeterFull','RoomMeterACOnly','ACSubmeter','UnitBased') then
  -- Extract Room Charges per unique Seator Number and insert into Expense Table
    Select Array(
      Select AVG(RoomRent) from RoomInfo
      where hostelid = p_HostelId
      Group by seaterno
      Order by seaterno
    ) Into RoomRents;

    Insert into Expenses(expenseid, securitycharges, messcharges, kitchencharges, internetcharges, acservicecharges, electricitybilltype, electricitycharges, roomcharges, isincludedinroomcharges)
    values(p_HostelId, p_SecurityCharges, p_MessCharges, p_KitchenCharges, p_InternetCharges, p_AcServiceCharges, p_ElectricitybillType, p_ElectricityCharges, RoomRents, false);

    return 1;             -- Successfully inserted
  End if;

  return -1;              -- Error: Wrong Electricity Bill Type Selected
End;
$$ LANGUAGE plpgsql;

--35, Update Hostel Expenses
Create or Replace function UpdateHostelExpenses(
  p_ExpenseId int,
  p_isIncludedInRoomCharges boolean,
  p_RoomCharges float[],
  p_SecurityCharges float,
  p_MessCharges float,
  p_KitchenCharges float,
  p_InternetCharges float,
  p_AcServiceCharges float,
  p_ElectricitybillType Text,
  p_ElectricityCharges float
) Returns int as $$
Begin
  if not exists(Select 1 from Expenses where expenseid = p_ExpenseId) then
    return 0;            -- Error: Hostel does not exists
  End if;

  if p_ElectricitybillType in ('RoomMeterFull','RoomMeterACOnly','ACSubmeter','UnitBased') then
    Update Expenses
    set isincludedinroomcharges = coalesce(p_isIncludedInRoomCharges, isincludedinroomcharges),
        roomcharges = coalesce(p_RoomCharges, roomcharges),
        securitycharges = coalesce(p_SecurityCharges, securitycharges),
        messcharges = coalesce(p_MessCharges, messcharges),
        kitchencharges = coalesce(p_KitchenCharges, kitchencharges),
        internetcharges = coalesce(p_InternetCharges, internetcharges),
        acservicecharges = coalesce(p_AcServiceCharges, acservicecharges),
        electricitybilltype = coalesce(p_ElectricitybillType, electricitybilltype),
        electricitycharges = coalesce(p_ElectricityCharges, electricitycharges)
    where expenseid = p_ExpenseId;
    return 1;             -- Successfully updated
  End if;

  return -1;              -- Error: Wrong Electricity Bill Type Selected
End;
$$ LANGUAGE plpgsql;

--36, Delete Hostel Expenses
Create or Replace function DeleteExpenses(
  p_ExpenseId int
) returns boolean as $$
Begin
  if not exists(Select 1 from expenses where expenseid = p_ExpenseId) then
    return false;
  End if;

  Delete from Expenses
  where expenseid = p_ExpenseId;

  return true;
End;
$$ LANGUAGE plpgsql;

--37, Display Expenses of a Hostel
Create or Replace function DisplayExpenses(
  p_HostelId int
)
Returns Table(
  p_isIncludedInRoomCharges boolean,
  p_RoomCharges float[],
  p_SecurityCharges float,
  p_MessCharges float,
  p_KitchenCharges float,
  p_InternetCharges float,
  p_AcServiceCharges float,
  p_ElectricitybillType Text,
  p_ElectricityCharges float
) as $$
Begin
  Return Query
  Select isincludedinroomcharges, roomcharges, securitycharges, messcharges, kitchencharges, internetcharges,
         acservicecharges, electricitybilltype, electricitycharges from Expenses
  where expenseid = p_HostelId;
End;
$$ LANGUAGE plpgsql;

Select * from displayexpenses(5);

--38, Students can Add Ratings on hostel
Create or Replace function AddHostelRating(
  p_HostelId int,
  p_StudentId int,
  p_RatingStar int,
  p_MaintenanceRating int,
  p_IssueResolvingRate int,     -- Number of days
  p_ManagerBehaviour int,
  p_Challenges Text
) Returns int as $$
Begin
  if not exists(Select 1 from hostel where hostelid = p_HostelId) then
    return 0;     -- Error: Hostel does not exists
  End if;

  if not exists(Select 1 from studentdemographics where studentid = p_StudentId) then
    return -1;    -- Error: Student does not exists
  End if;

  if p_RatingStar>=1 and p_RatingStar<=5
  and p_MaintenanceRating>=1 and p_MaintenanceRating<=5
  and p_ManagerBehaviour>=1 and p_ManagerBehaviour<=5
  then
    Insert into HostelRating(hostelid, studentid, ratingstar, maintenancerating, issueresolvingrate, managerbehaviour, challenges)
    values(p_HostelId, p_StudentId, p_RatingStar, p_MaintenanceRating, p_IssueResolvingRate, p_ManagerBehaviour, p_Challenges);

    return 1;        -- Rating Added Successfuly
  End if;

  return -2;         -- Error: Invalid Data Types
End;
$$ LANGUAGE plpgsql;

--39, Students can Update Rating on Hostel
Create or Replace function AddHostelRating(
  p_RatingId int,
  p_HostelId int,
  p_StudentId int,
  p_RatingStar int,
  p_MaintenanceRating int,
  p_IssueResolvingRate int,     -- Number of days
  p_ManagerBehaviour int,
  p_Challenges Text
) Returns int as $$
Begin
  if not exists(Select 1 from hostelrating where ratingid = p_RatingId and studentid = p_StudentId and hostelid = p_HostelId)
  then
    return 0;     -- Error: Rating Info Does not Exists
  End if;

  if p_RatingStar>=1 and p_RatingStar<=5
  and p_MaintenanceRating>=1 and p_MaintenanceRating<=5
  and p_ManagerBehaviour>=1 and p_ManagerBehaviour<=5
  then
    Update HostelRating
    set ratingstar = coalesce(p_RatingStar, ratingstar),
        maintenancerating = coalesce(p_MaintenanceRating, maintenancerating),
        issueresolvingrate = coalesce(p_IssueResolvingRate, issueresolvingrate),
        managerbehaviour = coalesce(p_ManagerBehaviour, managerbehaviour),
        challenges = coalesce(p_Challenges, challenges)
    where ratingid = p_RatingId and studentid = p_StudentId and hostelid = p_HostelId;

    return 1;        -- Rating Updated Successfuly
  End if;

  return -1;         -- Error: Invalid Data Types
End;
$$ LANGUAGE plpgsql;

--40, Students can Delete their Hostel Rating
Create or Replace function DeleteHostelRating(
  p_RatingId int,
  p_HostelId int,
  p_StudentId int
) Returns boolean as $$
Begin
  if not exists(Select 1 from hostelrating where ratingid = p_RatingId and studentid = p_StudentId and hostelid = p_HostelId)
  then
    return false;     -- Error: Rating Info Does not Exists
  End if;

  Delete from hostelrating
  where ratingid = p_RatingId;

  return true;
End;
$$ LANGUAGE plpgsql;

--41, Display All Rating Stars
Create or Replace function DisplayRatings()
Returns Table(
  p_RatingId int,
  p_HostelId int,
  p_StudentId int,
  p_RatingStar int,
  p_MaintenanceRating int,
  p_IssueResolvingRate int,     -- Number of days
  p_ManagerBehaviour int,
  p_Challenges Text
) as $$
Begin
  Return Query
  Select ratingid, hostelid, studentid, ratingstar, maintenancerating, issueresolvingrate, managerbehaviour, challenges
  from HostelRating;
End;
$$ LANGUAGE plpgsql;

Select * from displayratings();

--42, Display Details of Single Student
Create or Replace function DisplayStudent(
  p_StudentId int
)
Returns Table(
  p_Semester int,
  p_Department Text,
  p_Batch int,
  p_RoomateCount int,
  p_UniDistance float,
  p_isAcRoom boolean,
  p_isMess boolean,
  p_BedType varchar(50),
  p_WashroomType varchar(50)
) as $$
Begin
  Return Query
  Select semester, department, batch, roomatecount, unidistance, isacroom, ismess, bedtype, washroomtype
  from studentdemographics
  where studentid = p_StudentId;
End;
$$ LANGUAGE plpgsql;

Select * from displaystudent(1);

--43, Display All Stduents (By Admin)
Create or Replace function DisplayAllStudents()
Returns Table(
  p_Semester int,
  p_Department Text,
  p_Batch int,
  p_RoomateCount int,
  p_UniDistance float,
  p_isAcRoom boolean,
  p_isMess boolean,
  p_BedType varchar(50),
  p_WashroomType varchar(50)
) as $$
Begin
  Return Query
  Select semester, department, batch, roomatecount, unidistance, isacroom, ismess, bedtype, washroomtype
  from studentdemographics;
End;
$$ LANGUAGE plpgsql;

Select * from displayallstudents();

--44, Display App Suggestion (On Admin Page)
Create or Replace function DisplayUserSuggestions()
Returns Table(
  p_userid int,
  p_improvements text,
  p_defects text
) as $$
Begin
  Return Query
  Select userid, improvements, defects from appsuggestions;
End;
$$ LANGUAGE plpgsql;

Select * from displayusersuggestions();

--45, Display Details of a Hostel Manager
Create or Replace function DisplayManager(
  p_ManagerId int
)
Returns Table(
  p_PhotoLink Text,
  p_PhoneNo char(11),
  p_Education varchar(50),
  p_ManagerType varchar(50),
  p_OperatingHours int
) as $$
Begin
  Return Query
  Select photolink, phoneno, education, managertype, operatinghours
  from hostelmanager where managerid = p_ManagerId;
End;
$$ LANGUAGE plpgsql;

Select * from displaymanager(9);

--46, Display Details of All Managers (Used by Admin)
Create or Replace function DisplayAllManagers()
Returns Table(
  p_ManagerId int,
  p_PhotoLink Text,
  p_PhoneNo char(11),
  p_Education varchar(50),
  p_ManagerType varchar(50),
  p_OperatingHours int
) as $$
Begin
  Return Query
  Select managerid, photolink, phoneno, education, managertype, operatinghours
  from hostelmanager;
End;
$$ LANGUAGE plpgsql;

Select * from displayallmanagers();

--47, Display Details of a Hostel
Create or Replace function DisplayHostel(
  p_HostelId int
)
Returns Table(
  p_BlockNo varchar(100),
  p_HouseNo varchar(100),
  p_HostelType varchar(50),
  p_isParking boolean,
  p_NumRooms int,
  p_NumFloors int,
  p_WaterTimings Time,
  p_CleanlinessTenure int,      -- In Days
  p_IssueResolvingTenure int,   -- In Days
  p_MessProvide boolean,
  p_GeezerFlag boolean,
  p_name text
) as $$
Begin
  Return Query
  Select blockno, houseno, hosteltype, isparking, numrooms, numfloors, watertimings, cleanlinesstenure, issueresolvingtenure,
  messprovide, geezerflag, name from hostel
  where hostelid = p_HostelId;
End;
$$ LANGUAGE plpgsql;

Select * from displayhostel(5);

--48, Display Details of All Hostels
Create or Replace function DisplayAllHostels()
Returns Table(
  p_BlockNo varchar(100),
  p_HouseNo varchar(100),
  p_HostelType varchar(50),
  p_isParking boolean,
  p_NumRooms int,
  p_NumFloors int,
  p_WaterTimings Time,
  p_CleanlinessTenure int,      -- In Days
  p_IssueResolvingTenure int,   -- In Days
  p_MessProvide boolean,
  p_GeezerFlag boolean,
  p_name text
) as $$
Begin
  Return Query
  Select blockno, houseno, hosteltype, isparking, numrooms, numfloors, watertimings, cleanlinesstenure, issueresolvingtenure,
  messprovide, geezerflag, name from hostel;
End;
$$ LANGUAGE plpgsql;

Select * from displayallhostels();

--49, Display Pics of a Hostel
Create or Replace function DisplayHostelPics(
  p_HostelId int
)
Returns Table(
  p_PhotoLink text
) as $$
Begin
  Return Query
  Select photolink from hostelpics
  where hostelid = p_HostelId and ishostelpic = true;
End;
$$ LANGUAGE plpgsql;

Select * from displayhostelpics(5);

--50, Display pics of a Room
Create or Replace function DisplayRoomPics(
  p_HostelId int
)
Returns Table(
  p_PhotoLink text,
  p_RoomSeaterNo int
) as $$
Begin
  Return Query
  Select photolink, roomseaterno from hostelpics
  where hostelid = p_HostelId and ishostelpic = false;
End;
$$ LANGUAGE plpgsql;

Select * from displayroompics(5);

--51, Display Details of a HostelMess
Create or Replace function DisplayMessInfo(
  p_HostelId int
)
Returns Table(
  p_MessTimeCount int,
  p_Dishes text[]
) as $$
Begin
  Return Query
  Select messmeals, dishes from messdetails
  where messid = p_HostelId;
End;
$$ LANGUAGE plpgsql;

Select * from displaymessinfo(5);

--52, Display Kitchen Details
Create or Replace function DisplayKitchenDetails(
  p_HostelId int
)
Returns Table(
  p_isFridge boolean,
  p_isMicrowave boolean,
  p_isGas boolean
) as $$
Begin
  Return Query
  Select isfridge, ismicrowave, isgas from kitchendetails
  where kitchenid = p_HostelId;
End;
$$ LANGUAGE plpgsql;

Select * from displaykitchendetails(5);