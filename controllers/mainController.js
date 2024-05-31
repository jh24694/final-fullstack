// mainController.js
import fs from 'fs';
import User from '../models/user.js';
import passport from 'passport';

// Function to read image filenames from a folder
export const getImageFilenames = async (folderPath) => {
  try {
    const files = await fs.promises.readdir(folderPath);
    const imageFilenames = files.filter(file => /\.(png|jpe?g|gif)$/i.test(file));
    return imageFilenames;
  } catch (error) {
    console.error('Error reading image filenames:', error);
    return [];
  }
};

// Controller function for rendering the home page
export const home = async (req, res, imagesFolderPath) => {
  try {
    const imageFilenames = await getImageFilenames(imagesFolderPath);

    // Get the logged-in user's monsters
    const user = await User.findById(req.user._id).exec();
    const monsters = user.monsters;
    const currentMonsterIndex = user.currentMonster;

    // Render the index template with title, image filenames, and user's monsters data
    res.render('index', { 
      title: 'Monster Gallery', 
      imageFilenames, 
      monsters, 
      currentMonsterIndex 
    });
  } catch (error) {
    console.error('Error rendering index:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Controller function to update the current monster
export const updateCurrentMonster = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const user = await User.findById(req.user._id);
    user.currentMonster = req.body.currentMonsterIndex;
    await user.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating current monster:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Controller function to update the health of a specific monster
export const updateMonsterHealth = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const user = await User.findById(req.user._id);
    const { monsterIndex, health } = req.body;

    // Update the health of the specific monster
    if (user.monsters[monsterIndex]) {
      user.monsters[monsterIndex].health = health;
      await user.save();
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Monster not found' });
    }
  } catch (error) {
    console.error('Error updating monster health:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
