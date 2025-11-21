
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