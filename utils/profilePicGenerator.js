const generateProfilePic = (name = "Guest") => {
    // Extract initials (first letter of first & last name)
    const initials = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2); // Max 2 initials
    
    // Encode initials to handle special characters
    const encodedInitials = encodeURIComponent(initials);
    
    // Generate avatar URL
    return `https://ui-avatars.com/api/?name=${encodedInitials}&background=random&rounded=true`;
  };
  
  export default generateProfilePic;
  