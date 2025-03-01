# Student-Overwatch   
Student Analytics and Monitoring Through chrome extension data collection and graphing data for better understanding of students study progress.
 - [x] active tab monitor
 - [x] websites visited in real time 
 - [x] filtering websites based on affects on student learning
 - [x] generating relevant data for analytics
 - [x] sending the data reliably to the server
 - [x] student data representation
 - [x] stable server with most errors handled to avoid downtime
 - [ ] user data separation for every assignment
 - [ ] changes in curriculum based on student performance
 - [ ] parent portal for  student report
 - [ ] Improved Anti Plagiarism and cheating detection 

# How to install
1. extract the extension into the client computer.
2. Turn on developer mode in chrome and load Unpacked extension.
3. Run ```Node main.js``` to start the data collection sever.
4. run the Python script main.py ```python main.py``` To start the analytics website

## Dependencies
``` 
    #For Node Js server
    -"csv-parser": "^3.2.0",
    -"csv-writer": "^1.6.0",
    -"express": "^4.21.2",
    -"multer": "^1.4.5-lts.1" 
    #Python Pip Modules
    -Flask
    -Pandas
    -matplotlib
    -seaborn
    -sklearn
```
### Contributers
```@bosnian8275```  
```@swyam7980```
