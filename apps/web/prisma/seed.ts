import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  let user = await prisma.user.findFirst();

  if (!user) {
    const hashedPassword = await bcrypt.hash("admin@email.com", 12);
    user = await prisma.user.create({
      data: {
        name: "admin",
        email: "admin@email.com",
        password: hashedPassword,
      },
    });
  }

  // Sample job data based on the create-job-form structure
  const sampleJobs = [
    {
      title: "Senior Full Stack Developer",
      description: `We are seeking an experienced Full Stack Developer to join our dynamic engineering team. You will be responsible for developing and maintaining web applications using modern technologies, collaborating with cross-functional teams to deliver high-quality software solutions. The ideal candidate will have strong experience in both frontend and backend development, with a passion for creating scalable and efficient applications.

You will work on exciting projects that impact thousands of users and have the opportunity to mentor junior developers while contributing to architectural decisions. Our tech stack includes React, TypeScript, Node.js, and PostgreSQL, with deployment on AWS infrastructure.

Key Responsibilities:
- Develop and maintain full-stack web applications
- Collaborate with product managers and designers to implement new features
- Write clean, maintainable, and well-tested code
- Participate in code reviews and technical discussions
- Mentor junior developers and contribute to team knowledge sharing
- Optimize application performance and scalability

We offer competitive compensation, flexible working arrangements, and opportunities for professional growth in a supportive environment.`,
      skills:
        "React, TypeScript, Node.js, PostgreSQL, AWS, Docker, GraphQL, Next.js, Python, Redis",
      yearsOfExperience: 5,
      educationDegree: "Bachelor",
      educationField: "Computer Science",
      timezone: "GMT-8",
      skillsWeight: 0.4,
      experienceWeight: 0.3,
      educationWeight: 0.2,
      timezoneWeight: 0.1,
      interviewsNeeded: 3,
      hiresNeeded: 2,
      isOpen: true,
      employmentType: "Full-time",
      workplaceType: "Remote",
      location: null, // Remote job doesn't need a specific location
      benefits:
        "Competitive salary, health insurance, flexible working hours, remote work options, professional development budget, annual performance bonuses, unlimited PTO.",
      salaryType: "RANGE",
      salaryRangeMin: 100000,
      salaryRangeMax: 150000,
      salaryCurrency: "USD",
    },
    {
      title: "Product Manager - SaaS Platform",
      description: `Join our product team as a Product Manager to drive the strategy and execution of our innovative SaaS platform. You will work closely with engineering, design, and marketing teams to define product requirements, prioritize features, and ensure successful product launches.

The role involves conducting market research, analyzing user feedback, creating product roadmaps, and collaborating with stakeholders across the organization. We're looking for someone who can balance technical understanding with business acumen to deliver products that delight our customers and drive business growth.

Key Responsibilities:
- Define and execute product strategy and roadmap
- Collaborate with engineering and design teams to deliver features
- Conduct user research and analyze market trends
- Create and maintain product requirements documentation
- Lead cross-functional teams through product development lifecycle
- Monitor product metrics and user feedback to drive improvements
- Present product updates to leadership and stakeholders

This is an excellent opportunity to shape the future of our product and make a significant impact in a growing company.`,
      skills:
        "Product Strategy, Agile Methodologies, User Research, Data Analysis, SQL, Jira, Figma, A/B Testing, Market Research, Stakeholder Management",
      yearsOfExperience: 4,
      educationDegree: "Master",
      educationField: "Business Administration",
      timezone: "GMT-5",
      skillsWeight: 0.2,
      experienceWeight: 0.4,
      educationWeight: 0.2,
      timezoneWeight: 0.2,
      interviewsNeeded: 2,
      hiresNeeded: 1,
      isOpen: true,
      employmentType: "Full-time",
      workplaceType: "Hybrid",
      location: "New York, NY",
      benefits:
        "Competitive salary and equity, comprehensive health benefits, 401(k) matching, flexible work arrangements, professional development opportunities, team events and offsites.",
      salaryType: "FIXED",
      fixedSalary: 140000,
      salaryCurrency: "USD",
    },
    {
      title: "DevOps Engineer",
      description: `We are looking for a skilled DevOps Engineer to help us build and maintain robust, scalable infrastructure. You will be responsible for designing and implementing CI/CD pipelines, managing cloud infrastructure, ensuring system reliability, and improving deployment processes.

The ideal candidate will have experience with containerization, monitoring tools, and infrastructure as code. You'll work closely with development teams to streamline the software delivery lifecycle and ensure our systems can handle growing user demands while maintaining high availability and security standards.

Key Responsibilities:
- Design and maintain CI/CD pipelines for automated deployments
- Manage and optimize cloud infrastructure (AWS/Azure/GCP)
- Implement monitoring and alerting systems
- Ensure system security and compliance
- Automate infrastructure provisioning and configuration
- Troubleshoot production issues and implement solutions
- Collaborate with development teams on deployment strategies

We offer opportunities to work with cutting-edge technologies and contribute to the architecture of systems that serve millions of users.`,
      skills:
        "Kubernetes, Docker, AWS, Terraform, Jenkins, Prometheus, Grafana, Linux, Bash, Python, Ansible, Git",
      yearsOfExperience: 3,
      educationDegree: "Bachelor",
      educationField: "Computer Engineering",
      timezone: "GMT+0",
      skillsWeight: 0.5,
      experienceWeight: 0.3,
      educationWeight: 0.1,
      timezoneWeight: 0.1,
      interviewsNeeded: 2,
      hiresNeeded: 1,
      isOpen: true,
      employmentType: "Full-time",
      workplaceType: "Remote",
      location: "Remote - Europe",
      benefits:
        "Competitive compensation, remote work flexibility, health and dental insurance, learning and certification budget, home office stipend, annual company retreats.",
      salaryType: "RANGE",
      salaryRangeMin: 90000,
      salaryRangeMax: 130000,
      salaryCurrency: "USD",
    },
    {
      title: "Senior UX/UI Designer",
      description: `We're seeking a creative and user-focused UX/UI Designer to join our design team. You will be responsible for creating intuitive and engaging user experiences across our digital products. This role involves conducting user research, creating wireframes and prototypes, designing user interfaces, and collaborating with product managers and developers to bring designs to life.

The ideal candidate will have a strong portfolio showcasing their design process, from research and ideation to final implementation. You'll have the opportunity to influence product direction and shape the user experience for our growing customer base.

Key Responsibilities:
- Conduct user research to understand customer needs and behaviors
- Create wireframes, prototypes, and high-fidelity designs
- Design and maintain design systems and component libraries
- Collaborate with product managers to define user requirements
- Work with developers to ensure accurate implementation
- Conduct usability testing and iterate on designs
- Present design concepts to stakeholders and gather feedback

Join our team to create beautiful, functional designs that solve real user problems and drive business success.`,
      skills:
        "Figma, Sketch, Adobe Creative Suite, User Research, Prototyping, Wireframing, Design Systems, HTML, CSS, JavaScript, Usability Testing",
      yearsOfExperience: 4,
      educationDegree: "Bachelor",
      educationField: "Design",
      timezone: "GMT-7",
      skillsWeight: 0.4,
      experienceWeight: 0.3,
      educationWeight: 0.2,
      timezoneWeight: 0.1,
      interviewsNeeded: 3,
      hiresNeeded: 1,
      isOpen: true,
      employmentType: "Full-time",
      workplaceType: "Hybrid",
      location: "San Francisco, CA",
      benefits:
        "Competitive salary, equity package, comprehensive health coverage, flexible PTO, gym membership, professional development budget, hybrid work model with flexible hours.",
      salaryType: "RANGE",
      salaryRangeMin: 95000,
      salaryRangeMax: 135000,
      salaryCurrency: "USD",
    },
    {
      title: "Data Scientist",
      description: `Join our data team as a Data Scientist to extract insights from large datasets and drive data-informed decision making across the organization. You will develop machine learning models, conduct statistical analysis, create predictive algorithms, and work with stakeholders to translate business questions into analytical solutions.

The role involves working with various data sources, building dashboards and reports, and presenting findings to both technical and non-technical audiences. We're looking for someone with strong analytical skills and the ability to work with complex datasets to solve challenging business problems.

Key Responsibilities:
- Develop and deploy machine learning models and algorithms
- Conduct statistical analysis and data mining
- Create data visualizations and dashboards
- Collaborate with business stakeholders to identify opportunities
- Design and implement A/B tests and experiments
- Build data pipelines and ETL processes
- Present findings and recommendations to leadership
- Stay current with latest developments in data science and ML

This is an excellent opportunity to work with cutting-edge data science technologies and make a significant impact on business strategy and operations.`,
      skills:
        "Python, R, SQL, Machine Learning, TensorFlow, Pandas, NumPy, Tableau, Power BI, Statistics, A/B Testing, Data Visualization",
      yearsOfExperience: 3,
      educationDegree: "Master",
      educationField: "Data Science",
      timezone: "GMT+1",
      skillsWeight: 0.5,
      experienceWeight: 0.2,
      educationWeight: 0.2,
      timezoneWeight: 0.1,
      interviewsNeeded: 2,
      hiresNeeded: 1,
      isOpen: true,
      employmentType: "Full-time",
      workplaceType: "Remote",
      location: "Remote - Europe/Africa",
      benefits:
        "Competitive salary, remote work flexibility, health insurance, learning and conference budget, latest hardware and software, flexible working hours, annual team offsites.",
      salaryType: "RANGE",
      salaryRangeMin: 85000,
      salaryRangeMax: 125000,
      salaryCurrency: "USD",
    },
    {
      title: "Frontend Developer",
      description: `We are seeking a talented Frontend Developer to join our engineering team and help create exceptional user interfaces for our web applications. You will work closely with designers and backend developers to implement responsive, accessible, and performant user interfaces using modern frontend technologies.

The ideal candidate will have strong experience with React and TypeScript, along with a keen eye for detail and user experience. You'll be responsible for translating design mockups into interactive web applications while ensuring cross-browser compatibility and optimal performance.

Key Responsibilities:
- Develop responsive user interfaces using React and TypeScript
- Collaborate with UX/UI designers to implement pixel-perfect designs
- Optimize applications for maximum speed and scalability
- Ensure cross-browser compatibility and accessibility standards
- Write clean, maintainable, and well-documented code
- Participate in code reviews and contribute to best practices
- Stay up-to-date with latest frontend technologies and trends

Join our team to work on innovative projects and contribute to products that are used by thousands of users worldwide.`,
      skills:
        "React, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Next.js, Git, Webpack, Jest",
      yearsOfExperience: 2,
      educationDegree: "Bachelor",
      educationField: "Computer Science",
      timezone: "GMT+8",
      skillsWeight: 0.5,
      experienceWeight: 0.3,
      educationWeight: 0.1,
      timezoneWeight: 0.1,
      interviewsNeeded: 2,
      hiresNeeded: 2,
      isOpen: true,
      employmentType: "Full-time",
      workplaceType: "Remote",
      location: "Remote - Philippines",
      benefits:
        "Competitive salary, work-from-home setup, HMO coverage with dependents, paid time off, learning and development allowance, internet and electricity allowance, performance bonuses.",
      salaryType: "RANGE",
      salaryRangeMin: 60000,
      salaryRangeMax: 90000,
      salaryCurrency: "PHP",
    },
  ];

  // Create sample jobs
  console.log("🚀 Creating sample jobs...");

  for (const jobData of sampleJobs) {
    const job = await prisma.job.create({
      data: {
        ...jobData,
        createdById: user.id,
      },
    });
    console.log(`✅ Created job: ${job.title}`);
  }

  // Create some sample applicants for the first job
  const firstJob = await prisma.job.findFirst({
    where: { title: "Senior Full Stack Developer" },
  });

  if (firstJob) {
    console.log("👥 Creating sample applicants...");

    const sampleApplicants = [
      {
        name: "Alice Johnson",
        email: "alice.johnson@email.com",
        resume: "resumes/2024/alice-johnson-resume.pdf",
        statusAI: "completed",
        skillsScoreAI: 0.85,
        experienceScoreAI: 0.9,
        educationScoreAI: 0.8,
        timezoneScoreAI: 0.99,
        overallScoreAI: 0.87,
        skillsFeedbackAI: "Strong skills in React and Node.js.",
        experienceFeedbackAI: "6 years of relevant experience.",
        educationFeedbackAI: "Bachelor's degree in Computer Science.",
        timezoneFeedbackAI: "Excellent timezone match.",
        overallFeedbackAI: "Highly qualified candidate.",
        interviewStatus: "pending",
      },
      {
        name: "Bob Chen",
        email: "bob.chen@email.com",
        resume: "resumes/2024/bob-chen-cv.pdf",
        statusAI: "processing",
        skillsScoreAI: 0.0,
        experienceScoreAI: 0.0,
        educationScoreAI: 0.0,
        timezoneScoreAI: 0.0,
        overallScoreAI: 0.0,
        interviewStatus: "scheduled",
      },
      {
        name: "Carol Davis",
        email: "carol.davis@email.com",
        resume: "resumes/2024/carol-davis-resume.pdf",
        statusAI: "processing",
        skillsScoreAI: 0.72,
        experienceScoreAI: 0.65,
        educationScoreAI: 0.88,
        timezoneScoreAI: 0.85,
        overallScoreAI: 0.0,
        interviewStatus: "pending",
      },
    ];

    for (const applicantData of sampleApplicants) {
      const applicant = await prisma.applicant.create({
        data: {
          ...applicantData,
          jobId: firstJob.id,
        },
      });
      console.log(`✅ Created applicant: ${applicant.name}`);
    }
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
