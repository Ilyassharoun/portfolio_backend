import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import Project from '../models/Projects';
import Review from '../models/project_reviews';
import { sendContactEmail } from '../services/emailservice';
// Load environment variables
dotenv.config();

const router = express.Router();

// Get password from environment variable with a fallback
const defaultPassword = process.env.DEFAULT_PASSWORD || '';

// Contact route
/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Send a message from portfolio contact form
 *     description: Sends contact form data (name, email, phone, subject, message) to the portfolio owner via email.
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ilyass Haroun
 *               email:
 *                 type: string
 *                 example: example@gmail.com
 *               phone:
 *                 type: string
 *                 example: +212600000000
 *               subject:
 *                 type: string
 *                 example: Project Collaboration
 *               message:
 *                 type: string
 *                 example: I would like to discuss a project with you.
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Missing or invalid fields
 *       500:
 *         description: Internal server error
 */

router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required",
      });
    }

    // Email format validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Clean formatted message
    const fullMessage = `
New Portfolio Contact Message

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Subject: ${subject || "No subject"}

Message:
${message}
    `;

    // Updated service call
    await sendContactEmail({
      name,
      email,
      subject: subject || "Portfolio Contact",
      message: fullMessage,
    });

    return res.status(200).json({
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("Error sending contact form email:", error);

    return res.status(500).json({
      message: "Internal server error while sending message",
    });
  }
});

// Block route of assets
router.use('/assets', express.static(path.join(__dirname, '../assets')));

// CV download route
/**
 * @swagger
 * /api/cv:
 *   get:
 *     summary: Download CV
 *     description: Download the CV as a PDF file
 *     tags: [CV]
 *     responses:
 *       200:
 *         description: CV downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Internal server error while downloading CV
 */
router.get('/cv', (req, res) => {
    const filePath = path.join(__dirname, '../../../backend/assets/HarounIlyass.pdf');
    res.download(filePath, 'HarounIlyass.pdf', (err) => {
        if (err) {
            console.error('Error downloading CV:', err);
            res.status(500).json({ message: 'Internal server error while downloading CV' });
        }
    });
});

// Projects route
router.get('/routes/projects', (req, res) => {
    res.sendFile(path.join(__dirname, '../assets/projects.html'));
});

// Track visited route
router.get('/routes/track-visited', (req, res) => {
    const { url } = req.query;
    console.log(url);
    res.status(200).json({ message: 'Visited tracked successfully' });
});

// Login route using environment variable
/**
 * @swagger
 * /api/routes/login/{password}:
 *   get:
 *     summary: Login
 *     description: Login via URL parameter
 *     tags: [Login]
 *     parameters:
 *       - in: path
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *         description: The password for login
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid password
 *       500:
 *         description: Internal server error
 */
router.get('/routes/login/:password', (req, res) => {
    const { password } = req.params;
    console.log('Login attempt with password:', password);
    console.log('Expected password from env:', process.env.DEFAULT_PASSWORD ? '***' : 'Not set');
    
    if (!defaultPassword) {
        console.error('DEFAULT_PASSWORD is not set in environment variables');
        return res.status(500).json({ 
            message: 'Server configuration error',
            error: 'Password not configured' 
        });
    }
    
    if (password === defaultPassword) {
        // Generate a simple token (consider using JWT for production)
        const token = process.env.JWT_SECRET 
            ? 'jwt_token_here' // You'd generate a real JWT
            : 'temp_token_' + Date.now();
            
        res.status(200).json({ 
            message: 'Login successful', 
            token: token 
        });
    } else {
        res.status(401).json({ 
            message: 'Invalid password',
            hint: 'Check your .env file for DEFAULT_PASSWORD' 
        });
    }
});

// POST login route (alternative)
/**
 * @swagger
 * /api/routes/login:
 *   post:
 *     summary: Login via POST
 *     description: Login via request body
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid password
 *       500:
 *         description: Internal server error
 */
router.post('/routes/login', (req, res) => {
    const { password } = req.body;
    console.log('Login attempt via POST with password:', password);
    
    if (!defaultPassword) {
        return res.status(500).json({ 
            message: 'Server configuration error',
            error: 'Password not configured' 
        });
    }
    
    if (password === defaultPassword) {
        const token = process.env.JWT_SECRET 
            ? 'jwt_token_here'
            : 'temp_token_' + Date.now();
            
        res.status(200).json({ 
            message: 'Login successful', 
            token: token 
        });
    } else {
        res.status(401).json({ message: 'Invalid password' });
    }
});
/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve all projects from the database
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 *       500:
 *         description: Server error
 */
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieve a specific project by its MongoDB _id
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

/**
 * @swagger
 * /api/projects/projectid/{projectId}:
 *   get:
 *     summary: Get project by custom projectId
 *     description: Retrieve a specific project by its custom projectId field
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.get('/projects/projectid/:projectId', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
});

/**
 * @swagger
 * /api/projects/category/{category}:
 *   get:
 *     summary: Get projects by category
 *     description: Retrieve projects filtered by category
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [desktop, web, mobile]
 *     responses:
 *       200:
 *         description: List of projects in category
 *       500:
 *         description: Server error
 */
router.get('/projects/category/:category', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({ category: req.params.category });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
});
/**
 * @swagger
 * /api/review:
 *   post:
 *     summary: Add a new review
 *     description: Submit a new review for a project
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - name
 *               - rating
 *               - comment
 *             properties:
 *               projectId:
 *                 type: string
 *                 example: p_1
 *               name:
 *                 type: string
 *                 example: John Doe
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Great project!
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/review', async (req: Request, res: Response) => {
  try {
    const { projectId, name, rating, comment } = req.body;

    console.log('Received review data:', { projectId, name, rating, comment });

    // Validate input
    if (!projectId || !name || !rating || !comment) {
      return res.status(400).json({ 
        message: 'All fields are required',
        received: { projectId, name, rating, comment }
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Create new review
    const newReview = new Review({
      projectId,
      name,
      rating,
      comment,
    });

    const savedReview = await newReview.save();
    console.log('Review saved successfully:', savedReview);

    res.status(201).json({ 
      message: 'Review added successfully',
      review: savedReview 
    });

  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ 
      message: 'Error adding review',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/reviews/{projectId}:
 *   get:
 *     summary: Get reviews for a project
 *     description: Get all reviews for a specific project by its projectId
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID (p_1, p_2, etc.)
 *     responses:
 *       200:
 *         description: List of reviews
 *       500:
 *         description: Server error
 */
router.get('/reviews/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    console.log('Fetching reviews for projectId:', projectId);
    
    const reviews = await Review.find({ projectId }).sort({ createdAt: -1 });
    
    console.log(`Found ${reviews.length} reviews`);
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      message: 'Error fetching reviews',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;