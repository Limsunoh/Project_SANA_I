import re

def passwordValidation(pwd):
    if pwd is None:
        return False

    if len(pwd) < 8:
        return False
        
    elif re.search('[0-9]+', pwd) is None:
        return False
        
    elif re.search('[`~!@#$%^&*(),<.>/?]+', pwd) is None:
        return False 
    
    else:
        return True
