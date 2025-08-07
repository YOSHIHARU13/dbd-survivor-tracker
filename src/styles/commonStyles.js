// styles/commonStyles.js

export const colors = {
  primary: '#f13c20',
  secondary: '#600',
  background: '#111',
  backgroundLight: '#222',
  text: '#eee',
  textMuted: '#ccc',
  textDark: '#888',
  error: '#ff6b6b',
  google: '#4285f4',
};

export const styles = {
  container: { 
    maxWidth: "800px", 
    margin: "20px auto", 
    padding: "20px", 
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
    backgroundColor: colors.background, 
    color: colors.text, 
    borderRadius: "8px", 
    boxShadow: `0 0 15px ${colors.secondary}` 
  },
  
  heading: { 
    textAlign: "center", 
    color: colors.primary, 
    fontSize: "2rem", 
    marginBottom: "20px", 
    textShadow: `0 0 8px ${colors.primary}` 
  },
  
  label: { 
    display: "block", 
    marginBottom: "6px", 
    fontWeight: "600", 
    color: colors.primary 
  },
  
  input: { 
    width: "100%", 
    padding: "8px", 
    borderRadius: "4px", 
    border: `1px solid ${colors.secondary}`, 
    backgroundColor: colors.backgroundLight, 
    color: colors.text, 
    marginBottom: "16px", 
    fontSize: "1rem" 
  },
  
  select: { 
    width: "100%", 
    padding: "8px", 
    borderRadius: "4px", 
    border: `1px solid ${colors.secondary}`, 
    backgroundColor: colors.backgroundLight, 
    color: colors.text, 
    marginBottom: "16px", 
    fontSize: "1rem" 
  },
  
  button: { 
    backgroundColor: colors.primary, 
    color: colors.background, 
    border: "none", 
    borderRadius: "6px", 
    padding: "12px 24px", 
    fontWeight: "700", 
    fontSize: "1.1rem", 
    cursor: "pointer" 
  },
  
  radioGroup: { 
    display: "flex", 
    gap: "16px", 
    marginBottom: "16px", 
    alignItems: "center" 
  },
  
  radioLabel: { 
    cursor: "pointer", 
    userSelect: "none", 
    padding: "6px 12px", 
    borderRadius: "4px", 
    border: `1px solid ${colors.secondary}`, 
    backgroundColor: colors.backgroundLight, 
    color: colors.text 
  },
  
  radioLabelChecked: { 
    backgroundColor: colors.primary, 
    color: colors.background, 
    border: `1px solid ${colors.primary}` 
  },
  
  table: { 
    width: "100%", 
    borderCollapse: "collapse", 
    marginTop: "24px" 
  },
  
  th: { 
    borderBottom: `2px solid ${colors.primary}`, 
    padding: "10px", 
    textAlign: "center", 
    color: colors.primary 
  },
  
  td: { 
    borderBottom: `1px solid ${colors.secondary}`, 
    padding: "10px", 
    textAlign: "center" 
  },
  
  memoInput: { 
    width: "100%", 
    minHeight: "60px", 
    padding: "8px", 
    borderRadius: "4px", 
    border: `1px solid ${colors.secondary}`, 
    backgroundColor: colors.backgroundLight, 
    color: colors.text, 
    resize: "vertical", 
    fontSize: "1rem" 
  },
};