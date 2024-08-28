import { body, param, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const validate = (req, res, next) => {
    const errors = validationResult(req);

    const errorMessages = errors.array().map((error) => error.msg).join(", ");
    

    if(errors.isEmpty()) return next();
    else next(new ErrorHandler(errorMessages, 400));
};

  const registerValidator = () => [
body("name", "plz Enter a name").notEmpty(),
body("bio", "plz Enter a Bio").notEmpty(),
body("username", "plz Enter a Username").notEmpty(),
body("password", "plz enter password").notEmpty(),
];

  const loginValidator = () => [
    body("username", "Please Enter Usernameee").notEmpty(),
    body("password", "Please Enter Password").notEmpty(),
  ];
  
  const newGroupValidator = () => [
    body("name", "Please Enter Name").notEmpty(),
    body("members")
      .notEmpty()
      .withMessage("Please Enter Members")
      .isArray({ min: 2, max: 100 })
      .withMessage("Members must be 2-100"),
  ];
  
  const addMemberValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("members")
      .notEmpty()
      .withMessage("Please Enter Members")
      .isArray({ min: 1, max: 10 })
      .withMessage("plz select friends to add"),
  ];
  
  const removeMemberValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
    body("userId", "Please Enter User ID").notEmpty(),
  ];

  const leaveGroupValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
  ];

  const sendAttachmentsValidator = () => [
    body("chatId", "Please Enter Chat ID").notEmpty(),
  ];

  const chatValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
  ];

  const renameValidator = () => [
    param("id", "Please Enter Chat ID").notEmpty(),
    body("name", "Please Enter New Name").notEmpty(),
    ];

  const sendRequestValidator = () => [
      body("userId", "Please Enter userId").notEmpty(),
      ];

  const acceptRequestValidator = () => [
        body("requestId", "Please Enter Request Id").notEmpty(),
        body("accept", "Please Add Accept").notEmpty().isBoolean().
        withMessage("Accept must be a boolean"),
        ];

  const adminLoginValidator = () => [
    body("secretKey", "Please Enter secreyKey").notEmpty(),
  ];



export  {registerValidator, validate, loginValidator, newGroupValidator, addMemberValidator, removeMemberValidator, leaveGroupValidator , sendAttachmentsValidator, chatValidator, renameValidator, sendRequestValidator, acceptRequestValidator, adminLoginValidator};