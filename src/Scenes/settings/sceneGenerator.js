import { Scenes } from "./scenes"
import { SelectLanguage } from "../all/SelectLanguage"
import { SelectAccount } from "../all/SelectAccount"
import { SelectNameClient } from "../client/register/SelectNameClient"
import { SelectSurnameClient } from "../client/register/SelectSurnameClient"
import { SelectHeightClient } from "../client/register/SelectHeightClient"
import { SelectPhoneClient } from "../client/register/SelectPhoneClient"
import { SelectWeightClient } from "../client/register/SelectWeigthClient"
import { SelectAgeClient } from "../client/register/SelectAgeClient"
import { ConfirmRegisterClient } from "../client/register/ConfirmRegisterClient"
import { SelectInventoryTrainer } from "../trainer/timetable/Create/SelectInventoryTrainer"
import { InventoryEditCountTrainer } from "../trainer/timetable/Create/InventoryEditCountTrainer"
import { SelectMonthTrainer } from "../trainer/timetable/Create/SelectMonthTrainer"
import { SelectTimeTrainer } from "../trainer/timetable/Create/SelectTimeTrainer"
import { ConfirmCreateTimetableTrainer } from "../trainer/timetable/Create/ConfirmCreateTimetableTrainer"
import { SelectLocationClient } from "../client/register/SelectLocationScene"
import { SelectStudiaClient } from "../client/register/SelectStudiaClient"
import { BookingSelectInventoryClient } from "../client/booking/BookingSelectInventoryClient"
import { BookingNotFreeItemClient } from "../client/booking/BookingNotFreeItemClient"
import { BookingYesFreeItemClient } from "../client/booking/BookingYesFreeItemClient"
import { BookingConfirmClient } from "../client/booking/BookingConfirmClient"
import { NotifyTrainingClient } from "../client/notify/NotifyTrainingClient"
import { NotifyOneHourClient } from "../client/notify/NotifyOneHourClient"
import { CheckSelectDayTrainer } from "../trainer/timetable/Check/CheckSelectDayTrainer"
import { CheckSelectTimeTrainer } from "../trainer/timetable/Check/CheckSelectTimeTrainer"
import { CheckListOfClientsTrainer } from "../trainer/timetable/Check/CheckListOfClientsTrainer"
import { BookingNextTrainingClient } from "../client/booking/BookingNextTrainingClient"
import { NotifyRateClient } from "../client/notify/NotifyRateClient"
import { NotifyWaitingWithoutCancelClient } from "../client/notify/NotifyWaitingWithoutCancelClient"
import { BaseAllClientsTrainer } from "../trainer/BaseClients/BaseAllClientsTrainer"
import { BaseEditClientTrainer } from "../trainer/BaseClients/BaseEditClientTrainer"
import { SelectPrevTimetablesTrainer } from "../trainer/timetable/Create/SelectPrevTimetablesTrainer"
import { CheckRatesTrainer } from "../trainer/timetable/Check/CheckRatesTrainer"
import { NotifyWaitingWithCancelClient } from "../client/notify/NotifyWaitingWithCancelClient"
import { NotifyReviewClient } from "../client/notify/NotifyReviewClient"
import { CheckReviewsTrainer } from "../trainer/timetable/Check/CheckReviewsTrainer"
import { MessagesSelectTypeTrainer } from "../trainer/Messages/MessagesSelectTypeTrainer"
import { MessagesSelectOneUserTrainer } from "../trainer/Messages/MessagesSelectOneUserTrainer"
import { MessagesSendOneUserTrainer } from "../trainer/Messages/MessagesSendOneUserTrainer"
import { MessageSendAllUsersTrainer } from "../trainer/Messages/MessageSendAllUsersTrainer"
import { MessagesSelectDayTrainer } from "../trainer/Messages/MessagesSelectDayTrainer"
import { MessagesSelectTimeTrainer } from "../trainer/Messages/MessagesSelectTimeTrainer"
import { MessageSendAllTrainingTrainer } from "../trainer/Messages/MessageSendAllTrainingTrainer"
import { SetMaxCountClientsTrainer } from "../trainer/timetable/Create/SetMaxCountClientsTrainer"
import { BookingNotFreePlacesClient } from "../client/booking/BookingNotFreePlacesClient"
import { InventoryUsingTrainer } from "../trainer/timetable/Create/InventoryUsingTrainer"
import { BookingOfferClient } from "../client/booking/BookingOfferClient"
import { BookingSelectDayClient } from "../client/booking/BookingSelectDayClient"
import { BookingSelectTimeClient } from "../client/booking/BookingSelectTimeClient"
import { SelectNameTrainer } from "../trainer/register/SelectNameTrainer"
import { SelectSurnameTrainer } from "../trainer/register/SelectSurnameTrainer"
import { SelectPhoneTrainer } from "../trainer/register/SelectPhoneTrainer"
import { MainMenuTrainer } from "../trainer/Menu/MainMenuTrainer"
import { CreateStudiaTrainer } from "../trainer/timetable/Create/CreateStudiaTrainer"
import { SelectStudiaTrainer } from "../trainer/timetable/Create/SelectStudiaTrainer"
import { SelectCityTrainer } from "../trainer/timetable/Create/SelectCityTrainer"
import { CreateLocationTrainer } from "../trainer/timetable/Create/CreateLocationTrainer"
import { SelectLocationTrainer } from "../trainer/timetable/Create/SelectLocationTrainer"
import { SelectDayTrainer } from "../trainer/timetable/Create/SelectDayTrainer"
import { BotUpdate } from "../all/BotUpdate"
import { EditStudiaMenuTrainer } from "../trainer/Edit/EditStudiaMenuTrainer"
import { EditStudiaDescriptionTrainer } from "../trainer/Edit/EditStudiaDescriptionTrainer"
import { EditStudiaPhotoTrainer } from "../trainer/Edit/EditStudiaPhotoTrainer"
import { SelectStudiaDescriptionTrainer } from "../trainer/register/SelectStudiaDescriptionTrainer"
import { SelectStudiaPhotoTrainer } from "../trainer/register/SelectStudiaPhotoTrainer"
import { ConfirmStudiaClient } from "../client/register/ConfirmStudiaClient"
import { SelectTimetableTrainer } from "../trainer/timetable/Create/SelectTimetableTrainer"
import { BookingInfoClient } from "../client/booking/BookingInfoClient"
import { AbonementPreviewClient } from "../client/Abonement/AbonementPreviewClient"
import { AbonementBuyClient } from "../client/Abonement/AbonementBuyClient"
import { AbonementSuccessfullyClient } from "../client/Abonement/AbonementSuccessfullyClient"
import { BaseMenuTrainer } from "../trainer/BaseClients/BaseMenuTrainer"
import { BaseAllTrainersTrainer } from "../trainer/BaseClients/BaseAllTrainersTrainer"
import { RefLinkTrainer } from "../trainer/Link/RefLinkTrainer"

export const SceneGenerator = async (ctx, user, scene) => {
  switch (scene) {
    //ALL
    case Scenes.All.Account:
      await new SelectAccount(user, ctx).handler()
      break
    case Scenes.All.Language:
      await new SelectLanguage(user, ctx).handler()
      break
    case Scenes.All.Update:
      await new BotUpdate(user, ctx).handler()
      break
    //CLIENT
    case Scenes.Client.Register.Name:
      await new SelectNameClient(user, ctx).handler()
      break
    case Scenes.Client.Register.Surname:
      await new SelectSurnameClient(user, ctx).handler()
      break
    case Scenes.Client.Register.Age:
      await new SelectAgeClient(user, ctx).handler()
      break
    case Scenes.Client.Register.Height:
      await new SelectHeightClient(user, ctx).handler()
      break
    case Scenes.Client.Register.Phone:
      await new SelectPhoneClient(user, ctx).handler()
      break
    case Scenes.Client.Register.Weight:
      await new SelectWeightClient(user, ctx).handler()
      break
    case Scenes.Client.Register.ConfirmRegister:
      await new ConfirmRegisterClient(user, ctx).handler()
      break
    case Scenes.Client.Register.ConfirmStudia:
      await new ConfirmStudiaClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.SelectLocation:
      await new SelectLocationClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.SelectStudia:
      await new SelectStudiaClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.OfferBooking:
      await new BookingOfferClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.SelectDay:
      await new BookingSelectDayClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.SelectTime:
      await new BookingSelectTimeClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.SelectInventoryItem:
      await new BookingSelectInventoryClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.NotInventoryItem:
      await new BookingNotFreeItemClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.YesInventoryItem:
      await new BookingYesFreeItemClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.NotMaxClients:
      await new BookingNotFreePlacesClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.Info:
      await new BookingInfoClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.ConfirmBooking:
      await new BookingConfirmClient(user, ctx).handler()
      break
    case Scenes.Client.Notify.BeforeTraining:
      await new NotifyTrainingClient(user, ctx).handler()
      break
    case Scenes.Client.Notify.CheckIn:
      await new NotifyOneHourClient(user, ctx).handler()
      break
    case Scenes.Client.Booking.NextTraining:
      await new BookingNextTrainingClient(user, ctx).handler()
      break
    case Scenes.Client.Notify.RateTraining:
      await new NotifyRateClient(user, ctx).handler()
      break
    case Scenes.Client.Notify.ReviewTraining:
      await new NotifyReviewClient(user, ctx).handler()
      break
    case Scenes.Client.Notify.Waiting:
      await new NotifyWaitingWithoutCancelClient(user, ctx).handler()
      break
    case Scenes.Client.Notify.WaitingCheckIn:
      await new NotifyWaitingWithCancelClient(user, ctx).handler()
      break
    case Scenes.Client.Abonement.Preview:
      await new AbonementPreviewClient(user, ctx).handler()
      break
    case Scenes.Client.Abonement.Buy:
      await new AbonementBuyClient(user, ctx).handler()
      break
    case Scenes.Client.Abonement.Successfully:
      await new AbonementSuccessfullyClient(user, ctx).handler()
      break
    //TRAINER
    case Scenes.Trainer.Register.Name:
      await new SelectNameTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Register.Surname:
      await new SelectSurnameTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Register.Phone:
      await new SelectPhoneTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Register.Description:
      await new SelectStudiaDescriptionTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Register.Photos:
      await new SelectStudiaPhotoTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Actions:
      await new MainMenuTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.CreateStudia:
      await new CreateStudiaTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.SelectStudia:
      await new SelectStudiaTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.SelectCity:
      await new SelectCityTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.CreateLocation:
      await new CreateLocationTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.SelectLocation:
      await new SelectLocationTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.Inventory:
      await new SelectInventoryTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.InventoryUsing:
      await new InventoryUsingTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.InventoryEditCount:
      await new InventoryEditCountTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.SelectMonth:
      await new SelectMonthTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.SelectDay:
      await new SelectDayTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.SelectTime:
      await new SelectTimeTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.PrevTimetable:
      await new SelectPrevTimetablesTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.SelectTrainer:
      await new SelectTimetableTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.ConfirmTimetable:
      await new ConfirmCreateTimetableTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCreate.MaxCountClients:
      await new SetMaxCountClientsTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCheck.SelectDay:
      await new CheckSelectDayTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCheck.SelectTime:
      await new CheckSelectTimeTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCheck.ListOfClients:
      await new CheckListOfClientsTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCheck.RatesTraining:
      await new CheckRatesTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.TimetableCheck.ReviewsTraining:
      await new CheckReviewsTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Clients.Menu:
      await new BaseMenuTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Clients.AllTrainers:
      await new BaseAllTrainersTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Clients.AllClients:
      await new BaseAllClientsTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Clients.EditClient:
      await new BaseEditClientTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Messages.SelectType:
      await new MessagesSelectTypeTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Messages.SelectOneUser:
      await new MessagesSelectOneUserTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Messages.SendOneUser:
      await new MessagesSendOneUserTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Messages.SendAllUsers:
      await new MessageSendAllUsersTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Messages.SelectDayTraining:
      await new MessagesSelectDayTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Messages.SelectTimeTraining:
      await new MessagesSelectTimeTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.Messages.SendMessageAllTraining:
      await new MessageSendAllTrainingTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.EditStudia.Menu:
      await new EditStudiaMenuTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.EditStudia.Description:
      await new EditStudiaDescriptionTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.EditStudia.Photos:
      await new EditStudiaPhotoTrainer(user, ctx).handler()
      break
    case Scenes.Trainer.RefLink:
      await new RefLinkTrainer(user, ctx).handler()
      break
  }
}
