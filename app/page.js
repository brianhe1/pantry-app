'use client'

import { Box, Button, Modal, TextField, Stack, Typography, FormControl, InputLabel, Select, MenuItem, IconButton, FormControlLabel, Switch } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import Chip from '@mui/material/Chip';
import { useEffect, useState } from 'react';
import { firestore } from '@/firebase';
import { collection, doc, query, getDocs, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { styled, alpha } from '@mui/material/styles';
import CategoryIcon from '@mui/icons-material/Category';


const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '50px',
  backgroundColor: '#f4f4f4',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '500px',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

// modal styling
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  borderRadius: "15px",
  paddingBottom: "35px"
};

// category select menu 
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const categories = [
  "Canned goods",
  "Baking",
  "Breakfast",
  "Grains",
  "Oil & Vinegar",
  "Spices",
  "Toppings",
  "Snacks",
  "Sauces",
  "Miscellaneous"
];

const ColoredChip = ({ label, color }) => (
  <Chip
    label={label}
    sx={{
      backgroundColor: color,
      color: 'white',
    }}
  />
);

const colorMap = {
  "Canned goods": "#FF5722",
  "Baking": "#FFC107",
  "Breakfast": "#4CAF50",
  "Grains": "#00BCD4",
  "Oil & Vinegar": "#9C27B0",
  "Spices": "#E91E63",
  "Toppings": "#3F51B5",
  "Snacks": "#FF9800",
  "Sauces": "#009688",
  "Miscellaneous": "#673AB7"
};

const renderSelectedCategoryChips = (selected) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
    {selected.map((value) => (
      <ColoredChip
        key={value}
        label={value}
        color={colorMap[value] || '#CCCCCC'} // Default color if not found
      />
    ))}
  </Box>
);

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function Home() {
  const [pantry, setPantry] = useState([])

  // add item modal methods
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  

  const [itemName, setItemName] = useState([])

  const [searchQuery, setSearchQuery] = useState("");
  const [searchByCategory, setSearchByCategory] = useState(false);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      console.log(doc.id)
      pantryList.push({name: doc.id, ...doc.data()})
    })
    console.log(pantryList)
    setPantry(pantryList)
  }

  useEffect (() => {
    updatePantry();
  }, [] )

  const updateQuantity = async (itemName, change) => {
    const docRef = doc(collection(firestore, 'pantry'), itemName);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const newCount = (existingData.count || 0) + change;
      
      if (newCount > 0) {
        // update the document with the new count
        await setDoc(docRef, { count: newCount }, { merge: true });
      } else {
        // if count is 0 or less, remove the item
        await deleteDoc(docRef);
      }
    }
    await updatePantry(); // Refresh the pantry list
  };

  const addItem = async (item) => {
    // reference to document in the 'pantry' collection in firestore
    const docRef = doc(collection(firestore, 'pantry'), item)
    // check if item alr exists
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      // update count and categories
      const existingData = docSnap.data();
      const newCount = (existingData.count || 0) + 1; // increment count
      // get the existing categories and merge with new ones
      const existingCategories = existingData.categories || [];
      const newCategories = selectedCategory;
      const updatedCategories = [...new Set([...existingCategories, ...newCategories])];
      await setDoc(docRef, {
        count: newCount,
        categories: updatedCategories
      }, { merge: true }); // Use merge to update specific fields
    } else {
      // item does not exist, create a new document
      await setDoc(docRef, {
        count: 1,
        categories: selectedCategory
    });
    }
    await updatePantry()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
        // Remove the document if count is 1 or less
        await deleteDoc(docRef);
    }

    await updatePantry();
  };
  

  const categoryTheme = useTheme();
  const [selectedCategory, setCategory] = useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setCategory(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredPantry = pantry.filter((item) => {
    const { name, categories: itemCategories } = item;
  
    if (searchByCategory) {
      // If searching by category, check if the searchQuery is in the item's categories
      return itemCategories.some((category) =>
        category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Otherwise, search by item name
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });
  
  return (
    <Box 
      width="100vw" 
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      flexDirection={'column'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{ textAlign: 'center', mb: 2 }}>
            Add New Item
          </Typography>

          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField 
              id="outlined-basic" 
              label="Item Name" 
              variant="outlined" 
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}/>

            <div>
              <FormControl sx={{width: "100%" }}>
                <InputLabel id="demo-multiple-chip-label">Category</InputLabel>
                <Select
                  labelId="demo-multiple-chip-label"
                  id="demo-multiple-chip"
                  multiple
                  value={selectedCategory}
                  onChange={handleChange}
                  input={<OutlinedInput id="select-multiple-chip" label="Category" />}
                  renderValue={renderSelectedCategoryChips}
                  MenuProps={MenuProps}
                >
                  {categories.map((category) => (
                    <MenuItem
                      key={category}
                      value={category}
                      style={getStyles(category, selectedCategory, categoryTheme)}
                    >
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <Button variant="outlined" sx={{pt: 1.25, pb: 1.25}}
              onClick = {() => {
                addItem(itemName, selectedCategory)
                setItemName('')
                setCategory([])
                handleClose()
              }}>Add</Button>
          </Stack>
        </Box>
      </Modal>


      {/* ------- Pantry Box Label ------ */}
      <Box
          width="800px"
          height="100px"
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          >

          <Typography
            variant={'h2'}
            color={'#333'}
            textAlign={'center'}
          >
            my pantry
          </Typography>
        </Box>

      <Box sx={{display:"flex", flexDirection:"row"}}>
        {/* ------- Search Bar ------ */} 
        {searchByCategory ? (
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <FormControl sx={{ ml: 6, width: '450px', height: '39px' }}>
              <Select
                id="search-category"
                labelId="search-category-label"
                value={searchQuery}
                onChange={handleSearchChange}
                input={<OutlinedInput />}
                sx={{ height: '39px', borderRadius: '50px' }}
                displayEmpty
              >
                <MenuItem value="" disabled>search by category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Search>
        ) : (
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="search pantry"
              value={searchQuery}
              onChange={handleSearchChange}
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={searchByCategory}
              onChange={(e) => setSearchByCategory(e.target.checked)}
            />
          }
          label={<CategoryIcon sx={{ fontSize: 24, color: '#2196f3', mt: 1 }}/>}
        />
      </Box>
      

      {/* ------- Pantry List Container ------ */}
      <Box 
        borderTop="2px solid black"
        height="400px"
        paddingTop={2}
        marginBottom={2}
      >
        <Stack 
          width="800px"
          height="400px"
          spacing={1}
          overflow={'auto'}
        >
          {filteredPantry.map(({name, count, categories}) => (
            <Box
              key={name}
              width="100%"
              minHeight="50px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              pl={2}
              pr={2}
              borderRadius={"25px"}
            >

              {/* item name */}
              <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <Typography
                  variant='h8'
                  color={'#333'}
                  textAlign={'center'}
                  sx={{marginRight: '20px'}}
                >
                  {
                    // capitalize first letter of each list item
                    name.charAt(0).toUpperCase() + name.slice(1)
                  }
                </Typography>
                {/* selected category chips */}
                <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, overflowX: "auto", whiteSpace: 'nowrap', maxWidth: "565px"}}>
                  {categories.map((value) => (
                    <ColoredChip
                      key={value}
                      label={value}
                      color={colorMap[value] || '#CCCCCC'} // Default color if not found
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <IconButton
                  aria-label="subtract"
                  color="primary"
                  onClick={() => updateQuantity(name, -1)}
                  disabled={count <= 1} // Disable subtract button if count is 1 or less
                >
                  <RemoveIcon />
                </IconButton>
                <Typography variant={'h8'} color={'#333'} textAlign={'center'}>
                  {count}
                  </Typography>
                <IconButton
                  aria-label="add"
                  color="primary"
                  onClick={() => updateQuantity(name, 1)}
                >
                  <AddIcon />
                </IconButton>
          
                {/* delete button */}
                <IconButton aria-label="delete" color="error" onClick={() => removeItem(name)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>

            </Box>
          ))}
        </Stack>
      </Box>

        {/* ------- Add Pantry Item Button ------ */}
        <Button variant="contained" 
          onClick={handleOpen}
          sx={{
              textTransform: 'lowercase', // setting it to lowercase
              borderRadius: '50px',
              padding: '5px 20px',
          }}
        >
          add new item <AddIcon sx={{ marginLeft: 1 }} />
      </Button>
    </Box>
  )
}

