
Remaining tasks:

1. Upload image while creating work request
2. Upload image while creating work order
3. Check complete functionality of asset details page
4. Check complete functionality of home page
5. Implement Sensor Monitor functionality

UI changes to modify:
1. Password icon in login page - Done
2. Image overlaps on login screen
3. OTP verification email missing - Done
4. OTP boxes are not matching the design and some UI fixes - Done
5. Resend OTP functionality - Done
6. Image overlaps on OTP verification screen
7. Removed image from account > account settings because of overlapping
8. Background color changed for create part, and create preventive, select location, select asset, add parts
9. Assign button shadow added on form pages.
10. Work order presage logo image changed.
11. Create work order FAB button alignment.
12. Work order details page redesigned.
13. Assigned User sheet inside work order details is not populating user data.
14. Background color for the whole app is fixed.
15. Opening More options from tab bar, now all other tabs will still be clickable.
16. Datepicker popover is opening Year and Months correctly.
17. Login, Signup, Forgot password card shadow added as per figma.
18. Alarms Health Status API implemented.
19. Alarm Summary API implemented.



Functionality modifications:
1. Info cards should be clickable.
2. Asset Health graph y axis should be dynamic. Right now its scale is set to 10.
3. Alarm summary alert, critical, danger should be clickable.
4. Alarms time should be upto seconds as well - fixed
5. Parent and child locations keeps appearing from the previous account - fixed
6. Creating work order - Assets should be fetched for a specific location selected - fixed
7. Creating work order - If assets are not available for a location, it should show a message - fixed.
8. Creating work order - Estimation duration is in hours - fixed
9. Creating work order - Add Parts is not mandatory, so remove red staric from Add Parts field - fixed.
10. Creating work order - Users should be selected already on the basis of selected asset.
11. Creating work order - Selecting a user is mandatory on form - fixed.
12. Work order details - Comments are not visible, and replies are also visible - fixed.
13. Work order details - Should be able to post comments and comment replies - fixed.
14. Work order details - Should be able to delete comments and comment replies - fixed.
15. Work order details - Not returning the new status - fixed.
16. Create work order new design implementation - Done
17. Create new work order - adding tasks, adding forms - Done
18. Edit Work Order functionality
19. Location details screen is showing all assets which is wrong - fixed
20. Show Child Locations on location cards - fixed
21. Search Locations - fixed.
22. Search Assets - fixed.
23. Profile Image not updating - fixed.
24. Profile information edit modal - Done.
25. Create new endpoint - RPM input field and Bearing Number input field issue - fixed.
26. Assets Tab > Assets - New design - Done
27. Create Assets page design + functionality - Done (needs testing)
28. Create Location page design + functionalty - Done (needs testing)
29. Sign Up Page - Description error should be corrected - Fixed
29. New sign up page design implemented - Country code implemented - Done
30. Validation checks removed from both login and sign up pages - Done
31. Edit Location Functionality - Done (needs testing)
32. Delete Location Functionality - Done
33. Edit Asset Functionality - Done
34. Delete Asset Functionality - Done
35. Sign Up and Login new design for input fields - Done.
36. Assets Tab > Location - new design - Done
37. Add a child across each location - Done
38. Add a child across each asset - Done
39. Remove *Last Name* from the mandatory/required fields. In sign up - Done
40. While creating an asset, the *default time zone* should be set to *Kolkata*, with a dropdown selection option for other time zones. - Done
41. From the location page the asset should *redirect automatically to the Asset page*. - Done
42. In *Create Location, the **Choose File* option for image upload is not working. Please fix this - Fixed
42. Search feature for location and assets - Fixed
43. Accepting work request will now take the user to create a work order with new design - Done
44. FAB component had different margin bottom for different pages - Fixed
45. *Session management* issue is still not resolved. - not done
46. Profile Page new design - Done
47. Edit Profile new design + functionality - Done
48. - Removed password validation on both login and sign up (only one validation check is there, which will check if password and confirm password match or not). - Done
49. - Now you can select child locations as well while creating new work order, new work request, new part, new preventive - Done
50. Home page - Asset Health Graph on home page clickable - Done
51. Home page - Asset Health Status graph clickable - Done
52. Info page - Info cards clickable - Done (needs more testing)
53. Create work order - Only show other fields like name, category, location when form is selected - Done
54. Create work order - Add Task new UI + functionaity - Done
55. After updating profile details, the contact number shows empty
    - Unable to replicate this issue. Make sure you are testing the latest build I sent.

56. The work order details for “Assigned to Me”, “Created by Me”, and “Open for All” are not displaying correctly - Done
57. While creating a work order, change the field name “Message” to “Description” as per the UI - Done
58. While selecting a location, change the selection to a checkbox as per the provided UI. The edit option is not required there
    - Done (I have used the new UI opening up a pop up with a list of locations with check boxes)
59. While selecting assets, use a checkbox selection similar to the provided UI. - Done
60. In the work order, Nature of Work, Priority, and Estimated Duration should not be mandatory fields. - Done
61. Photo upload is not working while creating a work order - Done
62. Completed work order details are not displaying correctly.
63. While creating a location, the description should not be a required field. You have not marked it with *, but it is still showing a validation warning. - Done
64. User assignment while creating a location should be a required field. - Done
65. Attachments should not be a required field, but currently it is marked with *. - Done
66. Implement parent-child location hierarchy as per the provided UI.
67. When clicking the menu icon copy location  there should be copy of location should be created
68. Add Parts - Update according to the new UI. - Done
69. Preventive - Update according to the new UI.
     - Create Preventive - Done (tested)
     - Edit Preventive - Done (tested)
     - Delete Preventive - Done (tested)
     - Preventive Details - new design implemented - Done

70. Asset - Update according to the new UI. Under Asset → Sensor → Endpoint, the name is incorrect.
71. Work Request - Update according to the new UI.
72. Work Order details - Edit and Delete functionality - Done
73. Forms not populating while doing edit work order - check it later


I have fixed the Alarm Summary on overview page
Location edit option moved to location details page
Added loaders on all pages
Added Alert boxes while deleting location and asset
Copy location
Copy assets
Search Assets
Working on Asset Details page
Edit Asset is also pushed into asset details page, not on the assets tab.


Location picker modal changed on create asset page.
















1. Users sheet from asset details page
2. edit icon now moved inside asset details and location details
3. assets UI is now changed same as locations
4. icons should be bigger
5. staric issue















Changes to do latest: 16th December 2025

# Work Order

* The *Problem* section in *Open Work Orders* is showing *all data, including both **Assigned to Me* and *Created by Me*.

# PDM

* *Monitored assets* are showing *incorrect data*.

# CMMS

* *Incorrect data* is being displayed.

# Location Page

1. During *location update, the **previously uploaded image is not displayed*. - Done
2. The *location image appears only after refreshing* the location page. - Done

# Asset Page

1. While selecting the *trend chart, **kurtosis data* shows a warning: “Failed to load graph trend data.”
2. There is a *difference in asset health color*. - Done

# Sensor

* *Endpoint details* should be updated according to the *UI*.

# Work Order (Additional Issues)

1. *Assigned To* is *not showing exact data*.
2. *UI changes* are required.
3. *Images are not showing during update*.

# Parts

1. *Location is not clickable*. - Done

# Preventive

1. On the *detail page, views should be displayed **according to the saved Preventive data*.
- Done (No. of repitition, or end date will show depending on data)


















To Do - kamal 31st december 2025 list

1. While creating work order, start and end date should be autofilled, end date will be 3 days after start date. - Done
2. Calendar view while creating work order - Done
3. CMSS and PDM doesn't reload. - pull to refresh - Done
4. Work Order users getting undefined - Done
5. End date should be greater than start date - filter while submitting work order - Done
6. Validation on delete - Done
7. Complete Work Orders was not refreshing - Done
8. Validation on delete on preventive, gateway etc as well implemented - Done
9. Close More box when user press back button - Done
10. Menu icon from header removed - Done
11. Make non editable fields on edit profile dim - Done
12. Switched positions of asset health status and asset health
13. Alarms pagination should only show 10 alarms at max - Done
14. Planned vs Unplanned graph - Done
15. Show Tasks, Forms on work order details page - Done























To Do - kamal report 2nd January 2026
Please find below the pending points for Asset/Location


1.	Unable to upload image while creating location, app crashing. Issue with camera option as well.
    - Unable to reproduce

2.	Add touch animation on all clickable elements (whole app).


3.	Parent location name info missing while selecting child location.


4.	Not able to click any location when location list is scrolled to bottom.
    - Unable to reproduce

5.	Create Asset => Not auto fetching users assigned to selected location.
    - Unable to reproduce

6.	Create Asset => showing some static temp value.
7.	Remove asset_id from edit asset screen, this is auto generated and remains fixed for each created asset.
    - Done

8.	Not able to update users for created asset, can remove users but on adding new user it removes all existing ones from it.
    - Done

9.	Upload image for asset missing while creating/updating asset.
10.	Create endpoint in asset => RPM should be integer only.
    - Done

11.	Create endpoint => RPM and bearing details are not mandatory.
    - Done

12.	Create endpoint => Page not auto populating newly created endpoint.
    - Done

13.	Edit endpoint => Not able to update because of RPM and BFF missing, should be non-mandatory.
    - Done

14.	Deleting and endpoint => Page should auto refresh and select any endpoint as currently app shows config values of deleted endpoints.
    - Done

15.	Not able to attach sensor to an endpoint.
    - Done
    
16.	Icons for edit and attach sensor not working.
17.	Need to implement auto scroll in all pages where we are showing elements as list, currently need to scroll every time if coming back from an asset detail view screen.

18.	Asset trend graph zoom issue, once zoomed in, not able to zoom out.	
19.	Units are missing in trend chart for y-axis (will share units for all functions).
20.	Change aspect ratio of graph, rectangle not square.
21.	Color code of axis as per web application.
22.	Spectrum screen of any point => too much padding on top, need to reduce broad header.
23.	Acceleration Spectrum Envelope missing x-axis values, should be like Acceleration spectrum and units should be Hz.
24.	Selecting any axis in the trend line to view twf/spectrum should also highlight same axis in next screen, currently app is selecting previously selected axis.
25.	Spectrum data not correct => spectrum values for acceleration while clicking from RMS should be different from Peak. Api returns different response in web. Mobile app plotting both spectrums with same values, should be different.
26.	Selecting an asset with no sensor mapped shows trend data from previous selected asset and loader is present all the time. Remove loader on api call error.
27.	Change order of menu on “+” button on KPI page. Location>Asset>Work Order>Preventive>Parts>Work Request>Gateway. - Done













Pending points for Work Request / Preventive


•	Create WR => unable to select location.
•	Unable to attach images in create WR.
•	WR list not filtered, approved WR populating in pending section.
•	Create Parts => Available quantity/Minimum stock/Unit cost should be integers.
•	Create new part => app should redirect to parts home page, current populating create new parts model.
•	Part title missing on view part screen.
•	Delete and update options missing in parts.
•	Remove “Config” button from “More” option menu.
•	Change Calander for PM model.
