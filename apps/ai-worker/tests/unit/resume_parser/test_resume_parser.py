import pytest
from src.services.resume_parser import parse_resume_text


def test_parse_resume_text_complete_profile():
    """Test parsing a complete resume with education, experience, and skills."""
    resume_text = """Applicant 1
IT Specialist / Secretary
applicant1@email.com +6300000000 Philippines
SUMMARY
Motivated IT professional with experience in office administration, technical support, and multitasking. Highly adaptable, quick 
learner, and dedicated to delivering efficient and reliable solutions.
EDUCATION
Bachelor of Science in Information Technology
Western Mindanao State University
2015 - 2021 Philippines
High School Diploma
Zamboanga State College of Marine Sciences and Technology
2011 - 2015 Philippines
Elementary Education
Catalina Vda de Jalon Memorial School
2005 - 2011 Philippines
EXPERIENCE
IT Specialist (Intern)
Digilair Outsourcing Services
August 2019 - December 2019 Zamboanga City, Philippines
• Assisted with technical support and troubleshooting.
• Supported internal IT operations and data management.
• Gained experience in basic network and software maintenance.
Secretary
The Sushi Box Zamboanga
2022 - 2023 Zamboanga City, Philippines
• Managed administrative tasks including scheduling and documentation.
• Handled communication, record filing, and coordination with staff.
• Supported daily operations to ensure business efficiency.
SKILLS
Communication Multitasking Adaptability Time Management MS Office MS Excel
PowerPoint Video Editing Document Filing Teamwork
Made with Resumave"""

    result = parse_resume_text(resume_text)
    
    assert result['highestEducationDegree'] == 'Bachelor'
    assert result['educationField'] == 'Information Technology'
    assert result['timezone'] == 'GMT+8'
    assert 'Communication' in result['skills']
    assert len(result['experiencePeriods']) == 2
    assert result['experiencePeriods'][0]['jobTitle'] == 'IT Specialist (Intern)'